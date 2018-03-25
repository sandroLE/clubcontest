import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
    templateUrl: './changeDate.component.html',
})
export class ChangeDateDialog {

    public date:Date;

    constructor(public dialogRef: MatDialogRef<ChangeDateDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { 
        this.date = data.date;
        
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
