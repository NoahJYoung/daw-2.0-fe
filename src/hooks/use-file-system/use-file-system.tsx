/* eslint-disable react-refresh/only-export-components */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useState } from "react";
import {
  FormattedStorageQuota,
  getProjects,
  getSamplePacks,
  getStorageInfo,
} from "./helpers";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

export interface Project {
  lastModified: string;
  bpm: number;
  key: string;
  timeSignature: number;
  name: string;
  id: string;
  data: File;
  size: number;
}

export interface SamplePack {
  id: string;
  name: string;
  totalSamples: number;
  lastModified: string;
  description: string;
  data: File;
  size: number;
}

export interface FileSystemContextType {
  projects: Project[];
  samplePacks: SamplePack[];
  isLoading: boolean;
  isFileSystemSupported: boolean;
  isMobileDevice: boolean;
  saveProject: (
    projectName: string,
    projectZip: Blob,
    projectId?: string
  ) => Promise<string | void>;
  getProjectById: (projectId: string) => Project | null;
  deleteProject: (projectId: string) => Promise<void>;
  saveSamplePack: (
    packName: string,
    packZip: Blob,
    packId?: string
  ) => Promise<string | void>;
  getSamplePackById: (packId: string) => SamplePack | null;
  deleteSamplePack: (packId: string) => Promise<void>;
  importFile: (file: File, type: "project" | "sample") => Promise<void>;
  quota?: FormattedStorageQuota;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined
);

const detectEnvironment = () => {
  const isFileSystemSupported = "showDirectoryPicker" in window;
  const isMobileDevice =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return { isFileSystemSupported, isMobileDevice };
};

export const FileSystemProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rootDirectory, setRootDirectory] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [projectsDirectory, setProjectsDirectory] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [samplePacksDirectory, setSamplePacksDirectory] =
    useState<FileSystemDirectoryHandle | null>(null);
  const queryClient = useQueryClient();
  const { isFileSystemSupported, isMobileDevice } = useMemo(
    detectEnvironment,
    []
  );
  const [isFetchingRootDirectory, setIsFetchingRootDirectory] = useState(true);
  const { toast } = useToast();

  const invalidateProjectQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["PROJECTS"] });
    queryClient.invalidateQueries({ queryKey: ["STORAGE-INFO"] });
  }, [queryClient]);

  const invalidateSamplePackQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["SAMPLE-PACKS"] });
    queryClient.invalidateQueries({ queryKey: ["STORAGE-INFO"] });
  }, [queryClient]);

  const { data: projects, isFetching: isLoading } = useQuery({
    queryKey: ["PROJECTS"],
    queryFn: async () => await getProjects(projectsDirectory),
    enabled: !!rootDirectory && !!projectsDirectory,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const { data: samplePacks, isFetching: isLoadingSamplePacks } = useQuery({
    queryKey: ["SAMPLE-PACKS"],
    queryFn: async () => getSamplePacks(samplePacksDirectory),
    enabled: !!rootDirectory && !!samplePacksDirectory,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const { data: quota } = useQuery({
    queryKey: ["STORAGE-INFO"],
    queryFn: getStorageInfo,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const getRootDirectory = async () => {
      const root = await navigator.storage.getDirectory();
      setRootDirectory(root);

      const projectsDir = await root.getDirectoryHandle("projects", {
        create: true,
      });
      setProjectsDirectory(projectsDir);

      const samplePacksDir = await root.getDirectoryHandle("sample-packs", {
        create: true,
      });
      setSamplePacksDirectory(samplePacksDir);

      setIsFetchingRootDirectory(false);
    };
    getRootDirectory();
  }, []);

  const createProject = useCallback(
    async (projectName: string, projectZip: Blob) => {
      if (!projectsDirectory) {
        throw new Error("Root directory not initialized");
      }

      const projectId = uuidv4();
      const fileName = `${projectName}.${projectId}.velocity.app`;

      try {
        const fileHandle = await projectsDirectory.getFileHandle(fileName, {
          create: true,
        });

        const writable = await fileHandle.createWritable();
        await writable.write(projectZip);
        await writable.close();

        invalidateProjectQuery();

        return projectId;
      } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project");
      }
    },
    [invalidateProjectQuery, projectsDirectory]
  );

  const updateProject = useCallback(
    async (projectName: string, projectId: string, projectZip: Blob) => {
      if (!projectsDirectory) {
        throw new Error("Root directory not initialized");
      }

      const fileName = `${projectName}.${projectId}.velocity.app`;

      try {
        const existingFiles = await getProjects(projectsDirectory);
        const existingFile = existingFiles?.find((file) =>
          file.name.includes(projectId)
        );

        if (existingFile) {
          if (existingFile.name !== fileName) {
            await projectsDirectory.removeEntry(existingFile.name);
          }
        }

        const fileHandle = await projectsDirectory.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(projectZip);
        await writable.close();
        invalidateProjectQuery();
      } catch (error) {
        console.error("Error updating project:", error);
        throw new Error("Failed to update project");
      }
    },
    [invalidateProjectQuery, projectsDirectory]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!projectsDirectory) {
        throw new Error("Root directory not initialized");
      }

      try {
        const projectToDelete = projects?.find(
          (project) => project.id === projectId
        );

        if (projectToDelete) {
          const fileToDelete = projectToDelete.data;
          if (fileToDelete) {
            await projectsDirectory.removeEntry(fileToDelete.name);
            invalidateProjectQuery();
          } else {
            throw new Error(`Project with ID ${projectId} not found`);
          }
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        throw new Error("Failed to delete project");
      }
    },
    [invalidateProjectQuery, projects, projectsDirectory]
  );

  const saveProject = useCallback(
    async (projectName: string, projectZip: Blob, projectId?: string) => {
      if (projectId) {
        await updateProject(projectName, projectId, projectZip);
        invalidateProjectQuery();
      } else {
        const id = await createProject(projectName, projectZip);
        invalidateProjectQuery();
        return id;
      }
    },
    [createProject, invalidateProjectQuery, updateProject]
  );

  const getProjectById = useCallback(
    (projectId: string): Project | null => {
      if (!projectsDirectory) {
        throw new Error("Root directory not initialized");
      }

      try {
        const project = projects?.find((project) => project.id === projectId);

        if (project) {
          return project;
        }

        return null;
      } catch (error) {
        console.error("Error loading project:", error);
        throw new Error("Failed to load project");
      }
    },
    [projects, projectsDirectory]
  );

  const createSamplePack = useCallback(
    async (packName: string, packZip: Blob) => {
      if (!samplePacksDirectory) {
        throw new Error("Root directory not initialized");
      }

      const packId = uuidv4();
      const fileName = `${packName}.${packId}.velocity.app`;

      try {
        const fileHandle = await samplePacksDirectory.getFileHandle(fileName, {
          create: true,
        });

        const writable = await fileHandle.createWritable();
        await writable.write(packZip);
        await writable.close();

        invalidateSamplePackQuery();

        return packId;
      } catch (error) {
        console.error("Error creating sample pack:", error);
        throw new Error("Failed to create sample pack");
      }
    },
    [invalidateSamplePackQuery, samplePacksDirectory]
  );

  const updateSamplePack = useCallback(
    async (packName: string, packId: string, packZip: Blob) => {
      if (!samplePacksDirectory) {
        throw new Error("Root directory not initialized");
      }

      const fileName = `${packName}.${packId}.velocity.app`;

      try {
        const packs = await getSamplePacks(samplePacksDirectory);
        const existingPack = packs?.find((pack) => pack.id === packId);

        if (existingPack) {
          if (existingPack.name !== fileName) {
            await samplePacksDirectory.removeEntry(existingPack.data.name);
          }
        }

        const fileHandle = await samplePacksDirectory.getFileHandle(fileName, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(packZip);
        await writable.close();
        invalidateSamplePackQuery();
      } catch (error) {
        console.error("Error updating sample pack:", error);
        throw new Error("Failed to update sample pack");
      }
    },
    [invalidateSamplePackQuery, samplePacksDirectory]
  );

  const deleteSamplePack = useCallback(
    async (packId: string) => {
      if (!samplePacksDirectory) {
        throw new Error("Root directory not initialized");
      }

      try {
        const packToDelete = samplePacks?.find(
          (project) => project.id === packId
        );

        if (packToDelete) {
          const fileToDelete = packToDelete.data;
          if (fileToDelete) {
            await samplePacksDirectory.removeEntry(fileToDelete.name);
            invalidateSamplePackQuery();
          } else {
            throw new Error(`Sample pack with ID ${packId} not found`);
          }
        }
      } catch (error) {
        console.error("Error deleting sample pack:", error);
        throw new Error("Failed to delete sample pack");
      }
    },
    [invalidateSamplePackQuery, samplePacks, samplePacksDirectory]
  );

  const saveSamplePack = useCallback(
    async (packName: string, packZip: Blob, packId?: string) => {
      if (packId) {
        await updateSamplePack(packName, packId, packZip);
        invalidateSamplePackQuery();
      } else {
        const id = await createSamplePack(packName, packZip);
        invalidateSamplePackQuery();
        return id;
      }
    },
    [createSamplePack, invalidateSamplePackQuery, updateSamplePack]
  );

  const getSamplePackById = useCallback(
    (packId: string): SamplePack | null => {
      if (!samplePacksDirectory) {
        throw new Error("Root directory not initialized");
      }

      try {
        const samplePack = samplePacks?.find((pack) => pack.id === packId);

        if (samplePack) {
          return samplePack;
        }

        return null;
      } catch (error) {
        console.error("Error loading project:", error);
        throw new Error("Failed to load project");
      }
    },
    [samplePacks, samplePacksDirectory]
  );

  const importFile = useCallback(
    async (file: File, type: "project" | "sample") => {
      try {
        if (!rootDirectory) {
          throw new Error("Root directory not initialized");
        }

        if (type === "project") {
          await createProject(file.name.replace(".zip", ""), file);
          toast({
            title: "Success!",
            description: "Project imported successfully.",
            variant: "default",
          });
        } else {
          await createSamplePack(file.name.replace(".zip", ""), file);
          toast({
            title: "Success!",
            description: "Sample pack imported successfully.",
            variant: "default",
          });
        }
      } catch (error) {
        toast({
          title: "Error importing file",
          description:
            (error as Error).message ||
            "Failed to import file. Please try again.",
          variant: "destructive",
        });
      }
    },
    [createProject, createSamplePack, rootDirectory, toast]
  );

  const contextValue: FileSystemContextType = {
    projects: projects || [],
    samplePacks: samplePacks || [],
    isLoading: isLoading || isFetchingRootDirectory || isLoadingSamplePacks,
    isFileSystemSupported,
    isMobileDevice,
    quota,
    saveProject,
    saveSamplePack,
    getProjectById,
    getSamplePackById,
    deleteProject,
    deleteSamplePack,
    importFile,
  };

  return (
    <FileSystemContext.Provider value={contextValue}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = (): FileSystemContextType => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};
