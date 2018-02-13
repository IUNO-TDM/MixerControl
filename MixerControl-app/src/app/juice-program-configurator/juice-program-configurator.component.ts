import {Component, Input, OnInit} from '@angular/core';
import {HostListener} from '@angular/core';
import {ElementRef} from '@angular/core';
import {TdmProgram} from './models/tdmprogram';
import {TdmComponent} from './models/tdmcomponent';
import {TdmSequence} from './models/tdmprogram';
import {TdmPhase} from './models/tdmprogram';
import {MatDialog} from '@angular/material';
import {AddComponentDialogComponent} from './add-component-dialog/add-component-dialog.component';
import {PhaseDialogComponent} from './phase-dialog/phase-dialog.component';

@Component({
    selector: 'juice-program-configurator',
    templateUrl: './juice-program-configurator.component.html',
    styleUrls: ['./juice-program-configurator.component.css']
})

export class JuiceProgramConfiguratorComponent implements OnInit {
    @Input() program: TdmProgram = new TdmProgram();
    @Input() components: TdmComponent[] = [];

    validInterval = [-10000, 10000];
    pixelPerAmount = 1;
    snappingEpsilon = 3;
    snapLineOffset = -1;

    minPhaseAmount = 10;
    minTotalAmount = 100;
    maxTotalAmount = 120;
    maxTotalPause = 5000;


    // dragging
    draggingType: string = null;
    wasDragged = false;
    draggingPhase: TdmPhase;
    draggingStartValue = 0;
    draggingStartMouseX = 0;

    @HostListener('window:resize', ['$event'])
    windowResized(event: UIEvent) {
        this.updateScale();
    }

    @HostListener('touchmove', ['$event'])
    windowTouchMove(event: UIEvent) {
        var clientX = (event as TouchEvent).touches[0].clientX;
        this.dragMoved(clientX);
    }

    @HostListener('window:mousemove', ['$event'])
    windowMouseMove(event: MouseEvent) {
        var clientX = event.clientX;
        this.dragMoved(clientX);
    }

    private dragMoved(clientX: number) {
        if (this.draggingPhase != null) {
            this.wasDragged = true;
            var dx = clientX - this.draggingStartMouseX;
            var dxAmount = dx / this.pixelPerAmount;
            this.snapLineOffset = -1;
            if (this.draggingType == 'phase-start') {
                var draggingInterval = this.getDraggingInterval(this.draggingPhase);
                var newStart = Math.round(this.draggingStartValue + dxAmount);
                newStart = Math.max(draggingInterval[0], newStart);
                newStart = Math.min(draggingInterval[1], newStart);
                // check snapping
                var closestValue: number = null;
                var phaseEnd = newStart + this.draggingPhase.amount * 100 / this.draggingPhase.throughput;
                this.program.sequences.forEach(sequence => {
                    sequence.phases.forEach(p => {
                        if (p !== this.draggingPhase) {
                            if (closestValue == null) {
                                closestValue = p.start;
                            }
                            var pEnd = p.start + p.amount * 100 / p.throughput;
                            // compare start with other starts
                            if (Math.abs(newStart - p.start) < Math.abs(newStart - closestValue)) {
                                closestValue = p.start;
                                this.snapLineOffset = p.start;
                            }
                            // compare end with other starts
                            if (Math.abs(phaseEnd - p.start) < Math.abs(phaseEnd - (closestValue + this.draggingPhase.amount * 100 / this.draggingPhase.throughput))) {
                                closestValue = p.start - (this.draggingPhase.amount * 100 / this.draggingPhase.throughput);
                                this.snapLineOffset = p.start;
                            }
                            // compare start with other ends
                            if (Math.abs(newStart - pEnd) < Math.abs(newStart - closestValue)) {
                                closestValue = pEnd;
                                this.snapLineOffset = pEnd;
                            }
                            // compare end with other ends
                            if (Math.abs(phaseEnd - pEnd) < Math.abs(phaseEnd - (closestValue + this.draggingPhase.amount * 100 / this.draggingPhase.throughput))) {
                                closestValue = pEnd - (this.draggingPhase.amount * 100 / this.draggingPhase.throughput);
                                this.snapLineOffset = pEnd;
                            }

                        }
                    });
                });
                if (Math.abs(newStart - closestValue) < this.snappingEpsilon) {
                    newStart = closestValue;
                } else {
                    this.snapLineOffset = -1;
                }
                this.draggingPhase.start = newStart;
                this.program.updatePauses();
                this.updateScale();
            }

            if (this.draggingType == 'phase-throughput') {
                // calculate minimum throughput
                var remainingInterval = this.getRemainingInterval(this.draggingPhase);
                var remainingSize = remainingInterval[1] - this.draggingPhase.start;
                var minimumThroughput = this.draggingPhase.amount * 100 / remainingSize;
                minimumThroughput = Math.max(30, minimumThroughput);
                minimumThroughput = Math.ceil(minimumThroughput);

                // calculate throughput
                var throughput = this.draggingStartValue;
                var x = this.draggingPhase.amount * 100 / this.draggingStartValue - this.draggingPhase.amount + dxAmount;
                if (x > 0) {
                    var tpd = this.draggingPhase.amount * 100 / (this.draggingPhase.amount + x) - this.draggingStartValue;
                    tpd = Math.round(tpd);
                    throughput = this.draggingStartValue + tpd;
                    // check snapping
                    var closestValue: number = null;
                    var phaseEnd = this.draggingPhase.start + this.draggingPhase.amount * 100 / throughput;
                    this.program.sequences.forEach(sequence => {
                        sequence.phases.forEach(p => {
                            if (p !== this.draggingPhase) {
                                if (closestValue == null) {
                                    closestValue = p.start;
                                }
                                var pEnd = p.start + p.amount * 100 / p.throughput;
                                // compare end with other starts
                                if (Math.abs(phaseEnd - p.start) < Math.abs(phaseEnd - closestValue)) {
                                    closestValue = p.start;
                                    this.snapLineOffset = p.start;
                                }
                                // compare end with other ends
                                if (Math.abs(phaseEnd - pEnd) < Math.abs(phaseEnd - closestValue)) {
                                    closestValue = pEnd;
                                    this.snapLineOffset = pEnd;
                                }
                            }
                        });
                    });
                    if (Math.abs(phaseEnd - closestValue) < this.snappingEpsilon) {
                        throughput = Math.ceil(this.draggingPhase.amount * 100 / (closestValue - this.draggingPhase.start));
                    } else {
                        this.snapLineOffset = -1;
                    }
                    throughput = Math.min(100, throughput);
                    throughput = Math.max(minimumThroughput, throughput);
                } else {
                    throughput = 100;
                }
                this.draggingPhase.throughput = throughput;
                this.program.updatePauses();
                this.updateScale();
            }
        }
    }

    constructor(private elementRef: ElementRef, public dialog: MatDialog) {
    }

    private updateScale() {
        let content = this.elementRef.nativeElement.querySelector('.tdm-sequence-content');
        if (content != undefined) {
            var contentWidth = content.offsetWidth;
            var bounds = this.program.getBounds();
            var span = bounds[1] - bounds[0];
            if (span > 0) {
                var newPixelPerAmount = contentWidth / span;
                if (newPixelPerAmount != this.pixelPerAmount) {
                    this.pixelPerAmount = contentWidth / span;
                }
            }
        }
    }

    convertAmountToPixel(amount: number) {
        this.updateScale();
        var pixels = amount * this.pixelPerAmount;
        return pixels;
    }

    private getRemainingInterval(phase: TdmPhase) {
        for (var i = 0; i < this.program.sequences.length; i += 1) {
            var sequence = this.program.sequences[i];
            var processingPhase = null;
            var interval = [this.validInterval[0], this.validInterval[1]];
            for (var j = 0; j < sequence.phases.length; j += 1) {
                var p = sequence.phases[j];
                if (p == phase) {
                    processingPhase = p;
                } else {
                    if (processingPhase == null) {
                        interval[0] = p.start + p.amount * 100 / p.throughput;
                    } else {
                        interval[1] = p.start
                        break;
                    }
                }
            }
            if (processingPhase != null) {
                break;
            }
        }
        return interval;
    }

    private getDraggingInterval(phase: TdmPhase) {
        var interval = this.getRemainingInterval(phase);
        interval[1] = interval[1] - phase.amount * 100 / phase.throughput;
        return interval;
    }

    ngOnInit() {
    }

    getPhaseAmountLabel(phase: TdmPhase) {
        var title = phase.amount + " ml";
        if (phase.throughput != 100) {
            title = phase.amount + " ml (" + phase.throughput + " %)";
        }
        return title;
    }

    getSequenceAmountLabel(sequence: TdmSequence) {
        var label = sequence.getTotalAmount() + " ml";
        return label;
    }

    getTotalAmountLabel(program: TdmProgram) {
        var totalAmount = program.getTotalAmount();
        var label = totalAmount + " ml";
        return label;
    }

    getPausePhaseLabel(phase: TdmPhase) {
        var milliseconds = phase.amount / this.program.amountPerMillisecond;
        var seconds = Math.round(milliseconds / 100) / 10;
        var title = "" + seconds + " s";
        return title;
    }

    getTotalPauseLabel(sequence: TdmSequence) {
        var totalAmount = sequence.getTotalAmount();
        var milliseconds = totalAmount / this.program.amountPerMillisecond;
        var seconds = Math.round(milliseconds / 100) / 10;
        var label = seconds + " s";
        return label;
    }

    getPhaseStart(phase: TdmPhase) {
        var bounds = this.program.getBounds();
        var px = this.convertAmountToPixel(phase.start - bounds[0]);
        return px;
    }

    getSnapLineStart() {
        var px = -1;
        if (this.snapLineOffset > 0) {
            var bounds = this.program.getBounds();
            px = this.convertAmountToPixel(this.snapLineOffset - bounds[0]);
        }
        return px;
    }

    getThroughputHeight(phase: TdmPhase) {
        var bounds = this.program.getBounds();
        var px = this.convertAmountToPixel(phase.start - bounds[0]);
        return px;
    }

    getPhaseWidth(phase: TdmPhase) {
        var width = phase.amount * 100 / phase.throughput;
        var px = this.convertAmountToPixel(width);
        return px;
    }

    hasMinPhaseAmountError() {
        var error = false;
        var minPhaseAmount = this.minPhaseAmount;
        this.program.sequences.forEach(function (sequence) {
            sequence.phases.forEach(function (phase) {
                if (phase.amount < minPhaseAmount) {
                    error = true;
                }
            })
        });
        return error;
    }

    hasMinTotalAmountError() {
        var error = false;
        var totalAmount = this.program.getTotalAmount();
        if (totalAmount < this.minTotalAmount) {
            error = true;
        }
        return error;
    }

    hasMaxTotalAmountError() {
        var error = false;
        var totalAmount = this.program.getTotalAmount();
        if (totalAmount > this.maxTotalAmount) {
            error = true;
        }
        return error;
    }

    hasTotalPauseError() {
        var error = false;
        var totalAmount = this.program.pauseSequence.getTotalAmount();
        var milliseconds = totalAmount / this.program.amountPerMillisecond;
        if (milliseconds > this.maxTotalPause) {
            error = true;
        }
        return error;
    }

    getErrorText() {
        var errorText = "";
        if (this.hasMinPhaseAmountError()) {
            errorText += "Phase unterschreitet Mindestmenge(" + this.minPhaseAmount + " ml).<br>";
        }
        if (this.hasMinTotalAmountError()) {
            errorText += "Mindestmenge (" + this.minTotalAmount + " ml) unterschritten.<br>";
        }
        if (this.hasMaxTotalAmountError()) {
            errorText += "Höchstmenge (" + this.maxTotalAmount + " ml) überschritten.<br>";
        }
        if (this.hasTotalPauseError()) {
            errorText += "Zulässige Summe der Pausenzeiten (" + (this.maxTotalPause / 1000) + " s) überschritten.<br>";
        }
        return errorText;
    }

    removeSequence(sequence: TdmSequence) {
        this.program.removeSequence(sequence)
        this.updateScale();
    }

    @HostListener('touchend', ['$event'])
    @HostListener('window:mouseup', ['$event'])
    windowMouseUp(event: UIEvent) {
        this.draggingType = null;
        this.snapLineOffset = -1;
        if (this.draggingPhase != null) {
            this.program.normalize();
            this.updateScale();
        }
        this.draggingPhase = null;
    }

    // private getClientX(event: UIEvent) {
    //   var clientX = null;
    //   console.log("type:" + typeof(event));
    //   if (event instanceof TouchEvent) {
    //     clientX = event.touches[0].clientX;
    //   } else if (event instanceof MouseEvent) {
    //     clientX = event.clientX;
    //   }
    //   return clientX;
    // }

    startMouseDragThroughputHandle(phase: TdmPhase, event: MouseEvent) {
        var clientX = event.clientX;
        this.startDragThroughputHandle(phase, clientX);
    }

    startTouchDragThroughputHandle(phase: TdmPhase, event: TouchEvent) {
        var clientX = event.touches[0].clientX;
        this.startDragThroughputHandle(phase, clientX);
    }

    startDragThroughputHandle(phase: TdmPhase, clientX: number) {
        if (this.draggingType == null) {
            this.wasDragged = false;
            this.draggingType = 'phase-throughput';
            this.draggingPhase = phase;
            this.draggingStartMouseX = clientX;
            this.draggingStartValue = phase.throughput;
        }
    }

    startMouseDragPhaseStart(phase: TdmPhase, event: MouseEvent) {
        var clientX = event.clientX;
        this.startDragPhaseStart(phase, clientX);
    }

    startTouchDragPhaseStart(phase: TdmPhase, event: TouchEvent) {
        var clientX = event.touches[0].clientX;
        this.startDragPhaseStart(phase, clientX);
    }

    startDragPhaseStart(phase: TdmPhase, clientX: number) {
        if (this.draggingType == null) {
            this.wasDragged = false;
            this.draggingType = 'phase-start';
            this.draggingPhase = phase;
            this.draggingStartMouseX = clientX;
            this.draggingStartValue = phase.start;
        }
    }

    phaseClicked(phase: TdmPhase, event: UIEvent) {
        if (!this.wasDragged) {
            this.openPhaseDialog(phase);
        }
    }

    addComponent(component: TdmComponent) {
        var sequence = new TdmSequence();
        sequence.component = component;
        sequence.addPhase(new TdmPhase(0, 50, 100));
        this.program.addSequence(sequence);
        this.phaseChanged();
    }

    phaseChanged() {
        this.program.updatePauses();
        this.updateScale();
    }

    openAddComponentDialog() {
        // filter already used components
        var availableComponents = this.components.filter(component => {
            var alreadyUsed = false;
            this.program.sequences.forEach(sequence => {
                if (sequence.component === component) {
                    alreadyUsed = true;
                }
            });
            return !alreadyUsed;
        });

        // upen dialog
        let dialogRef = this.dialog.open(AddComponentDialogComponent, {
            // width: '250px',
            data: {
                components: availableComponents
            }
        });

        // handle dialog result
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != "") {
                this.addComponent(result);
            }
        });
    }

    openPhaseDialog(phase: TdmPhase) {
        // upen dialog
        let dialogRef = this.dialog.open(PhaseDialogComponent, {
            // width: '250px',
            data: {
                phase: phase
            }
        });

        // handle dialog result
        dialogRef.afterClosed().subscribe(result => {
            var action = result['action'];
            var amount = result['amount'];
            var phase = result['phase'];
            if (action == 'remove') {
                if (phase.sequence != null) {
                    var sequence = phase.sequence;
                    sequence.removePhase(phase);
                    if (sequence.phases.length == 0) {
                        this.program.removeSequence(sequence);
                    }
                }
            }
            if (action == 'split') {
                if (phase.sequence != null) {
                    var sequence = phase.sequence;
                    sequence.splitPhase(phase, amount);
                }
            }
            if (action == 'change') {
                if (phase.sequence != null) {
                    var sequence = phase.sequence;
                    sequence.changePhaseAmount(phase, amount);
                }
            }
            this.phaseChanged();
        });
    }

}

