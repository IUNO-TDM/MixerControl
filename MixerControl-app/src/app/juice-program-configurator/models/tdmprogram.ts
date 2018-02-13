import {TdmComponent} from './tdmcomponent'

export class TdmProgram {
    id: string;
    amountPerMillisecond = 0.01;
    sequences: TdmSequence[] = [];
    pauseSequence = new TdmSequence();

    addSequence(sequence: TdmSequence) {
        this.sequences.push(sequence);
        this.updatePauses();
    }

    removeSequence(sequence: TdmSequence) {
        var index = this.sequences.indexOf(sequence, 0);
        if (index > -1) {
            this.sequences.splice(index, 1);
        }
        this.updatePauses();
    }

    getBounds() {
        var bounds = [10000, 0];
        this.sequences.forEach(function (sequence) {
            sequence.phases.forEach(function (phase) {
                bounds[0] = Math.min(bounds[0], phase.start);
                bounds[1] = Math.max(bounds[1], phase.start + phase.amount * 100 / phase.throughput);
            });
        });
        return bounds;
    }

    getTotalAmount() {
        var total = 0;
        this.sequences.forEach(function (sequence) {
            total += sequence.getTotalAmount();
        });
        return total;
    }


    // moves phases so that the lowest phase starts at 0
    normalize() {
        var bounds = this.getBounds();
        this.sequences.forEach(function (sequence) {
            sequence.phases.forEach(function (phase) {
                phase.start -= bounds[0];
            });
        });
        this.updatePauses();
    }

    hasPause() {
        var value = this.pauseSequence.phases.length > 0
        return value;
    }

    updatePauses() {
        this.pauseSequence.clear();
        var bounds = this.getBounds();
        var span = bounds[1] - bounds[0];
        if (span > 0) {
            var pausePhases = [new TdmPhase(bounds[0], bounds[1] - bounds[0], 100)];
            this.sequences.forEach(function (sequence) {
                sequence.phases.forEach(function (phase) {
                    var temp: TdmPhase[] = [];
                    var phaseEnd = phase.start + phase.amount * 100 / phase.throughput;
                    pausePhases.forEach(function (pause) {
                        var pauseStart = pause.start;
                        var pauseEnd = pauseStart + pause.amount; // always 100% throughput
                        if (pauseEnd <= phase.start) { // no overlap
                            temp.push(pause);
                        } else if (pauseStart >= phaseEnd) { // no overlap
                            temp.push(pause);
                        } else if (pauseStart >= phase.start && pauseEnd <= phaseEnd) { // pause inside phase, remove pause
                            // nothing to do
                        } else if (pauseStart < phase.start && pauseEnd > phaseEnd) { // split
                            pause.start = pauseStart;
                            pause.amount = phase.start - pauseStart;
                            var pauseRight = new TdmPhase(phaseEnd, pauseEnd - phaseEnd, 100);
                            temp.push(pause);
                            temp.push(pauseRight);
                        } else if (pauseStart < phase.start && pauseEnd <= phaseEnd) { // cut right X
                            pause.start = pauseStart;
                            pause.amount = phase.start - pauseStart;
                            temp.push(pause);
                        } else if (pauseStart < phaseEnd && pauseEnd > phaseEnd) { // cut left
                            pause.start = phaseEnd;
                            pause.amount = pauseEnd - phaseEnd;
                            temp.push(pause);
                        }
                    });
                    pausePhases = temp;
                });
            });

            pausePhases.forEach(function (phase: TdmPhase) {
                this.pauseSequence.addPhase(phase);
            }.bind(this));
        }
    }

    getJSON() {
        const jsonProgram = {}; // program
        jsonProgram['amount-per-millisecond'] = this.amountPerMillisecond;
        const jsonSequences: any[] = []; // sequences
        this.sequences.forEach(sequence => {
            const jsonSequence = {}; // sequence
            jsonSequence['ingredient-id'] = sequence.component.id;
            const jsonPhases: any[] = []; // phases
            sequence.phases.forEach(phase => {
                const jsonPhase = {};
                jsonPhase['start'] = phase.start;
                jsonPhase['amount'] = phase.amount;
                jsonPhase['throughput'] = phase.throughput;
                jsonPhases.push(jsonPhase);
            });
            jsonSequence['phases'] = jsonPhases;
            jsonSequences.push(jsonSequence);
        });
        jsonProgram['sequences'] = jsonSequences;

        return jsonProgram;
    }
}

export class TdmSequence {
    id: string;
    component: TdmComponent;
    phases: TdmPhase[] = [];

    clear() {
        this.phases = [];
    }

    addPhase(phase: TdmPhase) {
        this.phases.push(phase);
        phase.sequence = this;
    }

    removePhase(phase: TdmPhase) {
        var index = this.phases.indexOf(phase, 0);
        if (index > -1) {
            this.phases.splice(index, 1);
            phase.sequence = null;
        }
    }

    changePhaseAmount(phase: TdmPhase, amount: number) {
        var index = this.phases.indexOf(phase, 0);
        if (index > -1) {
            var offset = (amount - phase.amount) * 100 / phase.throughput;
            phase.amount = amount;

            // shift next phases by offset
            var shift = false;
            for (var i = 0; i < this.phases.length; i += 1) {
                var p = this.phases[i];
                if (p == phase) {
                    shift = true;
                } else if (shift) {
                    p.start += offset;
                }
            }
        }
    }

    splitPhase(phase: TdmPhase, amount: number) {
        if (phase.amount - amount > 0) {
            phase.amount -= amount;
            var newPhaseStart = phase.start + phase.amount * 100 / phase.throughput;
            var newPhase = new TdmPhase(newPhaseStart, amount, phase.throughput);
            newPhase.sequence = this;
            // insert new Phase into phase array
            for (var i = 0; i < this.phases.length; i += 1) {
                var p = this.phases[i];
                if (p == phase) {
                    this.phases.splice(i + 1, 0, newPhase);
                    break;
                }
            }
        }
    }


    getTotalAmount() {
        var total = 0;
        this.phases.forEach(function (phase) {
            total += phase.amount;
        });
        return total;
    }
}

export class TdmPhase {
    id: string;
    sequence: TdmSequence;
    amount: number;
    start: number;
    throughput: number;

    constructor(start: number, amount: number, throughput: number) {
        this.start = start;
        this.amount = amount;
        this.throughput = throughput;
    }

    getEnd() {
        var end = this.start + this.amount * 100 / this.throughput;
        return end;
    }
}

