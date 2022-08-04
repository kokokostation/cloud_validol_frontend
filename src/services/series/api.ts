import {createApi, fetchBaseQuery, FetchBaseQueryError} from '@reduxjs/toolkit/query/react'
import {GetSeriesResponse, UpdateSeriesPollResponse, UpdateSeriesStartRequest, UpdateSeriesStartResponse} from './types'
import {sleep} from '../../utils/common';

export const adminSeriesApi = createApi({
    reducerPath: 'adminSeriesApi',
    baseQuery: fetchBaseQuery({baseUrl: '/admin-api'}),
    endpoints: (builder) => ({
        getSeries: builder.query<GetSeriesResponse, void>({
            query: () => '/series',
        }),
        updateSeries: builder.mutation<void, UpdateSeriesStartRequest>({
            async queryFn(arg, {dispatch}, _extraOptions, fetchWithBQ) {
                const startResponse = await fetchWithBQ({
                    url: '/series/update_start',
                    method: 'POST',
                    body: arg
                });
                if (startResponse.error) {
                    throw startResponse.error;
                }
                const startResponseBody = startResponse.data as UpdateSeriesStartResponse;
                const jobId = startResponseBody.job_id;

                while (true) {
                    await sleep(3000);

                    const pollResponse = await fetchWithBQ({
                        url: '/series/update_poll?' + new URLSearchParams({
                            job_id: jobId
                        }),
                    });
                    if (pollResponse.error) {
                        throw pollResponse.error;
                    }
                    const pollResponseBody = pollResponse.data as UpdateSeriesPollResponse;

                    if (pollResponseBody.job_info.status === 'SUCCESS') {
                        return {data: undefined};
                    } else if (pollResponseBody.job_info.status === 'FAILURE') {
                        return {
                            error: {
                                status: 'CUSTOM_ERROR',
                                error: pollResponseBody.job_info.message
                            } as FetchBaseQueryError
                        };
                    }
                }
            }
        })
    }),
});

export const {useGetSeriesQuery, useUpdateSeriesMutation} = adminSeriesApi;
