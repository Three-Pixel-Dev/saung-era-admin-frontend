
// src/types/code.ts

export interface Code {
  id: number;
  name: string;
  description: string;
}

export interface CodeValue {
  id: number;
  name: string;
  description: string;
  codeId: number;
}

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


