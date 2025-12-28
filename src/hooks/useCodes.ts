import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { codeApi } from "@/api/codeApi";
import { CodeValueDto, CodeValueRequest } from "@/types/code";

export const codeKeys = {
  all: ["codes"] as const,
  values: (codeId: number) => [...codeKeys.all, "values", codeId] as const,
};

export function useCodeValues(codeId: number) {
  return useQuery({
    queryKey: codeKeys.values(codeId),
    queryFn: () => codeApi.getValuesByCodeId(codeId),
  });
}

export function useCreateCodeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CodeValueRequest) => codeApi.createValue(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: codeKeys.values(variables.codeId),
      });
    },
  });
}

export function useUpdateCodeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CodeValueRequest }) =>
      codeApi.updateValue(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: codeKeys.values(variables.data.codeId),
      });
    },
  });
}

export function useDeleteCodeValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, codeId }: { id: number; codeId: number }) =>
      codeApi.deleteValue(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: codeKeys.values(variables.codeId),
      });
    },
  });
}

