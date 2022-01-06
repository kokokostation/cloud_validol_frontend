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

export interface PutSeriesRequest {
    derivatives: DerivativeInfo[]
}

export async function getSeries(): Promise<GetSeriesResponse> {
    const response = await fetch('/admin-api/series');
    const response_json = await response.json();

    return response_json as GetSeriesResponse;
}

export async function putSeries(derivaties: PutSeriesRequest) {
    await fetch('/admin-api/series', {
        method: 'PUT',
        body: JSON.stringify(derivaties)
    })
}

