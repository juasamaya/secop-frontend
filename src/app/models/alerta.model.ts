export interface ContratoAlerta {
  id_contrato: string;
  nombre_entidad: string;
  proveedor_adjudicado: string;
  modalidad_de_contratacion: string;
  valor_del_contrato: number;
  riesgo_corrupcion: number;
  motivo_alerta: string;
}

export interface RespuestaApi {
  total_alertas: number;
  parametros_usados: any;
  datos: ContratoAlerta[];
}