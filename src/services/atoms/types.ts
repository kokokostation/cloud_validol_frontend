export type ColumnState = 'BASIC' | 'IN_SYNC' | 'SYNC_NEEDED' | 'SUPERSET_ONLY' | 'VALIDOL_ONLY';

export interface UserExpression {
    expression: string,
    basic_atoms_expression: string
}

export interface SupersetExpression {
    expression: string
}

export interface Column {
    name: string,
    state: ColumnState,
    user_expression?: UserExpression,
    superset_expression?: SupersetExpression
}

export interface Dataset {
    superset_id: number,
    name: string,
    columns: Column[]
}

export interface GetAtomsResponse {
    datasets: Dataset[]
}

export interface PushColumn {
    name: string,
    basic_atoms_expression: string
}

export interface PushAtomsRequest {
    superset_dataset_id: number,
    columns: PushColumn[]
}

export interface CreateAtomRequest {
    name: string,
    expression: string,
    superset_dataset_id: number
}

export interface UpdateAtomRequest {
    name: string,
    expression: string,
}

export interface DeleteAtomRequest {
    name: string
}
