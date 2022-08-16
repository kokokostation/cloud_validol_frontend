import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {datasetsFetched} from '../../features/atom_list/atomListSlice';
import {CreateAtomRequest, DeleteAtomRequest, GetAtomsResponse, PushAtomsRequest, UpdateAtomRequest} from './types'

export const atomsApi = createApi({
    reducerPath: 'atomsApi',
    baseQuery: fetchBaseQuery({baseUrl: '/admin-api'}),
    tagTypes: ['Atoms'],
    endpoints: (builder) => ({
        getAtoms: builder.query<void, void>({
            async queryFn(_arg, {dispatch}, _extraOptions, fetchWithBQ) {
                const getAtomsResponse = await fetchWithBQ('/atoms');
                if (getAtomsResponse.error) {
                    throw getAtomsResponse.error;
                }
                const getAtomsResponseBody = getAtomsResponse.data as GetAtomsResponse;

                dispatch(datasetsFetched(getAtomsResponseBody));

                return {data: undefined};
            },
            providesTags: () => [{type: 'Atoms', id: 'LIST'}]
        }),
        pushAtoms: builder.mutation<void, PushAtomsRequest>({
            query(body) {
                return {
                    url: `/atoms/superset_push`,
                    method: 'POST',
                    body,
                }
            },
            invalidatesTags: [{type: 'Atoms', id: 'LIST'}],
        }),
        createAtom: builder.mutation<void, CreateAtomRequest>({
            query(body) {
                return {
                    url: `/atom`,
                    method: 'POST',
                    body,
                }
            },
            invalidatesTags: [{type: 'Atoms', id: 'LIST'}],
        }),
        updateAtom: builder.mutation<void, UpdateAtomRequest>({
            query(body) {
                return {
                    url: `/atom`,
                    method: 'PUT',
                    body,
                }
            },
            invalidatesTags: [{type: 'Atoms', id: 'LIST'}],
        }),
        deleteAtom: builder.mutation<void, DeleteAtomRequest>({
            query(query) {
                return {
                    url: `/atom?name=${query.name}`,
                    method: 'DELETE',
                }
            },
            invalidatesTags: [{type: 'Atoms', id: 'LIST'}],
        }),
    }),
});

export const {
    useGetAtomsQuery,
    usePushAtomsMutation,
    useCreateAtomMutation,
    useUpdateAtomMutation,
    useDeleteAtomMutation
} = atomsApi;
