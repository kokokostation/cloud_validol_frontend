export interface DerivativeName {
    platform_source: string,
    platform_code: string,
    derivative_name: string
}

export interface DerivativeInfo {
    source: string,
    series_id: bigint,
    visible: boolean
}

export interface Derivative {
    name: DerivativeName,
    info: DerivativeInfo
}

export interface GetSeriesResponse {
    derivatives: Derivative[]
}

export interface UpdateSeriesStartRequest {
    derivatives: DerivativeInfo[]
}

export interface UpdateSeriesStartResponse {
    job_id: string
}

export interface UpdateSeriesPollResponse {
    job_info: {
        status: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS',
        message?: string
    }
}
