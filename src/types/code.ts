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