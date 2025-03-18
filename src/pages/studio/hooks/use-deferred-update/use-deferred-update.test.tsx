// import { renderHook, act } from "@testing-library/react";
// import { describe, it, vi, expect } from "vitest";
// import { useDeferredUpdate } from "./use-deferred-update";

// describe("useDeferredUpdate", () => {
//   it("should initialize with the initial value", () => {
//     const { result } = renderHook(() => useDeferredUpdate<number>(10, vi.fn()));

//     expect(result.current.localValue).toBe(10);
//   });

//   it("should update localValue on onValueChange", () => {
//     const { result } = renderHook(() => useDeferredUpdate<number>(10, vi.fn()));

//     act(() => {
//       result.current.onValueChange(20);
//     });

//     expect(result.current.localValue).toBe(20);
//   });

//   it("should call onCommit with the latest value on onValueCommit", () => {
//     const onCommitMock = vi.fn();

//     const { result } = renderHook(() =>
//       useDeferredUpdate<number>(10, onCommitMock)
//     );

//     act(() => {
//       result.current.onValueChange(20);
//     });

//     act(() => {
//       result.current.onValueCommit();
//     });

//     expect(onCommitMock).toHaveBeenCalledWith(20);
//   });

//   it("should reset localValue when initialValue changes based on deps", () => {
//     let initialValue = 10;
//     const { result, rerender } = renderHook(() =>
//       useDeferredUpdate<number>(initialValue, vi.fn(), [initialValue])
//     );

//     expect(result.current.localValue).toBe(10);

//     initialValue = 30;
//     rerender();

//     expect(result.current.localValue).toBe(30);
//   });

//   it("should not reset localValue if deps do not change", () => {
//     const { result, rerender } = renderHook(() =>
//       useDeferredUpdate<number>(10, vi.fn(), [1])
//     );

//     act(() => {
//       result.current.onValueChange(20);
//     });

//     expect(result.current.localValue).toBe(20);

//     rerender();

//     expect(result.current.localValue).toBe(20);
//   });
// });
