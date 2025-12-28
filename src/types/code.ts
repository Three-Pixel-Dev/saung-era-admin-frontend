export interface CodeValueDto {
  id: number;
  codeId: number;
  name: string;
  description?: string;
}

export interface CodeValueRequest {
  codeId: number;
  name: string;
  description?: string;
}

