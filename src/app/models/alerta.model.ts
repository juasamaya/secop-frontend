export interface ContratoAlerta {
  id_contrato: string;
  nombre_entidad: string;
  proveedor_adjudicado: string;
  modalidad_de_contratacion: string;
  valor_del_contrato: number;
  riesgo_corrupcion: number;
  motivo_alerta: string;
}

export interface Metadata {
  total_alertas: number;
  pagina_actual: number;
  total_paginas: number;
  limite_por_pagina: number;
}

export interface RespuestaApi {
  metadata: Metadata;
  parametros_usados: any;
  datos: ContratoAlerta[];
}

export interface FiltrosMotor {
  departamento?: string | null;
  ciudad?: string | null;
  entidad?: string | null;
  busqueda?: string | null;
  umbral_corbatas?: number;
  umbral_fraccionamiento?: number;
  umbral_valor?: number;
  pagina: number;
  limite: number;
  [key: string]: any; 
}