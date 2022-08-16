import React, {useMemo, useState} from 'react';
import {
    useDeleteAtomMutation,
    useGetAtomsQuery,
    usePushAtomsMutation,
    useUpdateAtomMutation
} from '../../services/atoms/api';

import styles from './AtomList.module.css'
import Select from 'react-select';
import {Button, Divider,} from '@mui/material';
import {useAppSelector} from '../../app/hooks';
import Box from '@mui/material/Box';
import {
    DataGrid,
    GridActionsCellItem,
    GridCellEditStartParams,
    GridColumns,
    GridRowId,
    GridRowModel,
    GridRowModes,
    GridRowModesModel,
    GridRowParams,
    MuiEvent
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {PushColumn} from "../../services/atoms/types";
import {AtomEditor} from "../atom_editor/AtomEditor";


export function AtomList() {
    const [supersetDatasetId, setSupersetDatasetId] = useState<number | null>(null);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

    const datasets = useAppSelector(state => state.datasets);
    const rows = useMemo(() => {
        if (!supersetDatasetId) {
            return [];
        }

        return Object.values(datasets[supersetDatasetId].columns).map((column) => ({
            name: column.name,
            state: column.state,
            user_expression: column.user_expression?.expression,
            basic_atoms_expression: column.user_expression?.basic_atoms_expression,
            superset_expression: column.superset_expression?.expression,
        }));
    }, [supersetDatasetId, datasets]);

    useGetAtomsQuery();
    const [pushAtoms] = usePushAtomsMutation();
    const [updateAtom] = useUpdateAtomMutation();
    const [deleteAtom] = useDeleteAtomMutation();

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({...rowModesModel, [id]: {mode: GridRowModes.Edit}});
    };
    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({...rowModesModel, [id]: {mode: GridRowModes.View}});
    };
    const handleDeleteClick = (id: GridRowId) => () => {
        deleteAtom({name: id as string});
    };
    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: {mode: GridRowModes.View, ignoreModifications: true},
        });
    };
    const processRowUpdate = (newRow: GridRowModel) => {
        updateAtom({name: newRow.name, expression: newRow.user_expression});

        return newRow;
    };

    const columns: GridColumns = [
        {
            field: 'name',
            headerName: 'Name',
            description: 'Atom name',
            flex: 3
        },
        {
            field: 'state',
            headerName: 'State',
            description: 'Atom state with respect to superset',
            flex: 2
        },
        {
            field: 'user_expression',
            headerName: 'User expression',
            description: 'Atom expression, provided by user',
            flex: 3,
            editable: true
        },
        {
            field: 'basic_atoms_expression',
            headerName: 'Reduced user expression',
            description: 'Atom expression, provided by user, expressed through superset dataset metrics',
            flex: 5
        },
        {
            field: 'superset_expression',
            headerName: 'Superset expression',
            description: 'Atom expression, currently present in superset',
            flex: 5
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 2,
            getActions: ({id, row}) => {
                if (!row.user_expression) {
                    return [];
                }

                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon/>}
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon/>}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Box sx={{display: 'flex', flexDirection: 'row'}}>
                    <Box sx={{display: 'flex', flexDirection: 'row', width: '50%', marginRight: '10px'}}>
                        <Button
                            disabled={selectedColumns.length === 0}
                            onClick={() => {
                                if (!supersetDatasetId || !selectedColumns) {
                                    return;
                                }

                                pushAtoms({
                                    superset_dataset_id: Number(supersetDatasetId),
                                    columns: selectedColumns.map(
                                        name => ({
                                            name,
                                            basic_atoms_expression: datasets[supersetDatasetId].columns[name].user_expression?.basic_atoms_expression
                                        })
                                    ).filter(
                                        column => !!column.basic_atoms_expression
                                    ) as PushColumn[]
                                })
                            }}
                        >
                            Push to superset
                        </Button>
                        <Select
                            className={styles.select}
                            options={Object.entries(datasets).map(([superset_id, {name}]) => ({
                                label: name,
                                value: superset_id
                            }))}
                            isSearchable
                            onChange={selectedOption => {
                                setSupersetDatasetId(selectedOption && Number(selectedOption.value));
                                setSelectedColumns([]);
                            }}
                        />
                    </Box>
                    <Divider
                        orientation={'vertical'}
                    />
                    <Box sx={{width: '50%', marginLeft: '20px'}}>
                        <AtomEditor
                            supersetDatasetId={supersetDatasetId}
                        />
                    </Box>
                </Box>
                {supersetDatasetId &&
                <Box sx={{flexGrow: 1, flexBasis: 'auto'}}>
                  <DataGrid
                    sx={{height: '100%'}}
                    rows={rows}
                    columns={columns}
                    rowModesModel={rowModesModel}
                    pageSize={10}
                    checkboxSelection
                    onSelectionModelChange={(ids) => setSelectedColumns(ids as string[])}
                    isRowSelectable={({row}: GridRowParams) => (['SYNC_NEEDED', 'VALIDOL_ONLY'].includes(row.state))}
                    disableSelectionOnClick
                    getRowId={row => row.name}
                    onCellEditStart={(params: GridCellEditStartParams, event: MuiEvent) => {
                        event.defaultMuiPrevented = true;
                    }}
                    processRowUpdate={processRowUpdate}
                    experimentalFeatures={{newEditingApi: true}}
                  />
                </Box>
                }
            </Box>
        </>
    );
}
