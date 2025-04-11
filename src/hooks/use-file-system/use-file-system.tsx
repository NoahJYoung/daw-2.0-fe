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
import { getProjects } from "./helpers";
import { v4 as uuidv4 } from "uuid";

export interface Project {
  lastModified: string;
  bpm: number;
  key: string;
  timeSignature: number;
  name: string;
  id: string;
  data: File;
}

export interface FileSystemContextType {
  projects: Project[] | undefined;
  isLoading: boolean;
  isFileSystemSupported: boolean;
  isMobileDevice: boolean;
  saveProject: (
    projectName: string,
    projectZip: Blob,
    projectId?: string
  ) => Promise<string | void>;
  getProjectById: (projectPath: string) => Project | null;
  deleteProject: (projectId: string) => Promise<void>;
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
  const queryClient = useQueryClient();
  const { isFileSystemSupported, isMobileDevice } = useMemo(
    detectEnvironment,
    []
  );

  const invalidateProjectQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["PROJECTS"] });
  }, [queryClient]);

  const { data: projects, isFetching: isLoading } = useQuery({
    queryKey: ["PROJECTS"],
    queryFn: () => getProjects(rootDirectory),
    enabled: !!rootDirectory,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const getRootDirectory = async () => {
      const root = await navigator.storage.getDirectory();
      setRootDirectory(root);
    };
    getRootDirectory();
  }, []);

  const createProject = useCallback(
    async (projectName: string, projectZip: Blob) => {
      if (!rootDirectory) {
        throw new Error("Root directory not initialized");
      }

      const projectId = uuidv4();
      const fileName = `${projectName}.${projectId}.velocity.app`;

      try {
        const fileHandle = await rootDirectory.getFileHandle(fileName, {
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
    [invalidateProjectQuery, rootDirectory]
  );

  const updateProject = useCallback(
    async (projectName: string, projectId: string, projectZip: Blob) => {
      if (!rootDirectory) {
        throw new Error("Root directory not initialized");
      }

      const fileName = `${projectName}.${projectId}.velocity.app`;

      try {
        const existingFiles = await getProjects(rootDirectory);
        const existingFile = existingFiles?.find((file) =>
          file.name.includes(projectId)
        );

        if (existingFile) {
          if (existingFile.name !== fileName) {
            await rootDirectory.removeEntry(existingFile.name);
          }
        }

        const fileHandle = await rootDirectory.getFileHandle(fileName, {
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
    [invalidateProjectQuery, rootDirectory]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!rootDirectory) {
        throw new Error("Root directory not initialized");
      }

      try {
        const projectToDelete = projects?.find(
          (project) => project.id === projectId
        );

        if (projectToDelete) {
          const fileToDelete = projectToDelete.data;
          if (fileToDelete) {
            await rootDirectory.removeEntry(fileToDelete.name);
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
    [invalidateProjectQuery, projects, rootDirectory]
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
      if (!rootDirectory) {
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
    [projects, rootDirectory]
  );

  const contextValue: FileSystemContextType = {
    projects,
    isLoading,
    isFileSystemSupported,
    isMobileDevice,
    saveProject,
    getProjectById,
    deleteProject,
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
