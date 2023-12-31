import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


export type ConfirmationProps = {
    title: string,
    dialogueContent?: string,
    actionButtonTitle?: string,
    onActionButtonClick?: Function,
    onCancelButtonClick: Function,
}

/**
 * Component to render screen confirmation boxes. 
 */
export function ConfirmationBox(props: ConfirmationProps) {

  return (
    <div>
      <Dialog
        open={true}
        onClose={() => props.onCancelButtonClick()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.dialogueContent ? props.dialogueContent : ""}
          </DialogContentText>
        </DialogContent>
        {props.actionButtonTitle && <DialogActions>
          <Button onClick={() => props.onCancelButtonClick()}>Cancel</Button>
          {props.onActionButtonClick && <Button onClick={() => props.onActionButtonClick!()} autoFocus>
            {props.actionButtonTitle}
          </Button>}
        </DialogActions>}
        {!props.actionButtonTitle && <DialogActions>
          <Button onClick={() => props.onCancelButtonClick()}>Ok</Button>
        </DialogActions>}
      </Dialog>
    </div>
  );
}