import React, {useState} from 'react';
import {useCreateAtomMutation} from '../../services/atoms/api';

import {Button, Dialog, DialogTitle, IconButton, Input,} from '@mui/material';
import Box from '@mui/material/Box';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


interface AtomEditorProps {
    supersetDatasetId: number | null,
    name?: string,
    expression?: string
}


export function AtomEditor(props: AtomEditorProps) {
    const [atomName, setAtomName] = useState<string>(props.name ?? '');
    const [expression, setExpression] = useState<string>(props.expression ?? '');
    const [atomDialogOpen, setAtomDialogOpen] = useState<boolean>(false);
    const [createAtom, {isLoading: isAtomCreated}] = useCreateAtomMutation();

    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'row'}}>
                <Input sx={{flex: 1}}
                       placeholder={'Enter new atom expression here'}
                       value={expression}
                       onChange={event => setExpression(event.target.value)}
                />
                <IconButton
                    disabled={expression.length === 0 || !props.supersetDatasetId}
                    onClick={() => setAtomDialogOpen(true)}
                >
                    <AddCircleOutlineIcon color="primary"/>
                </IconButton>
            </Box>
            <Dialog open={atomDialogOpen} sx={{position: 'absolute'}}>
                <DialogTitle>Provide atom name</DialogTitle>
                <Input
                    sx={{width: '80%', margin: 'auto'}}
                    value={atomName}
                    onChange={event => setAtomName(event.target.value)}/>
                <Button
                    disabled={atomName.length === 0}
                    onClick={() => {
                        createAtom({
                            name: atomName,
                            expression: expression,
                            superset_dataset_id: props.supersetDatasetId as number
                        }).unwrap().then(() => {
                            setExpression('');
                        }).finally(() => {
                            setAtomName('');
                            setAtomDialogOpen(false);
                        })
                    }}
                >
                    Save
                </Button>
            </Dialog>
        </>
    );
}
