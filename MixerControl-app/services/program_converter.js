var self = {};
// ******************************************
//   Conversion Utilities
// ******************************************
var amountPerMillisecond = 0.05;

self.convertProgramToMachineProgram = function(program) {
    function log(string) {
        // console.log(string);
    }
    var convertedJson = {};
    var sequences = {};

    var amountPerMillisecond = program['amount-per-millisecond'];
    log("amountPerMillisecond = " + amountPerMillisecond);
	log("Converter started...");
    log("Program: "+program);

    // copy sequences
    program['sequences'].forEach(function(sequence) {
		log("sequence: "+sequence['ingredient-id'])
//        var copySequence = jQuery.extend(true, {}, sequence);
        var copySequence = JSON.parse(JSON.stringify(sequence)); // ugly, there's something better for sure
        sequences[sequence['ingredient-id']] = copySequence
    });

    var jsonLines = [];
    var phasesAvailable = true;
    while (phasesAvailable) {
        log("");
        log(" ############################## new run ##############################");
        // calculate phasesToProcess
        var phasesToProcess = {};
        log(" # Phases to process: ")
        for (var key in sequences) {
			var sequence = sequences[key];
			var phases = sequence['phases'];
            if (phases.length > 0) {
                var phase = phases[0];
                if (phase['start'] == 0) {
                    phasesToProcess[key] = phase;
                    log("   - start = "+phase['start']+", amount = "+phase['amount']+", throughput = "+phase['throughput']);
                    sequence.phases.shift();
                }
            }
		}

        // log remaining phases
        log(" # Remaining phases: ")
        for (var key in sequences) {
            var sequence = sequences[key];
			var phases = sequence['phases'];
            phases.forEach(function(phase) {
                    log("   - start = "+phase['start']+", amount = "+phase['amount']+", throughput = "+phase['throughput']);
            });
        }
        var phaseCount = Object.keys(phasesToProcess).length;
        if (phaseCount == 0) {
            break;
        }

        // calculate min/max throughput
        var maxThroughput = -1;
        var minThroughput = -1;
        for (var key in phasesToProcess) {
            var phase = phasesToProcess[key];
            if (maxThroughput == -1) {
                maxThroughput = phase['throughput'];
                minThroughput = phase['throughput'];
            } else {
                maxThroughput = Math.max(maxThroughput, phase['throughput']);
                minThroughput = Math.min(minThroughput, phase['throughput']);
            }
		}

        // calculate targetMode
        var targetMode = 1;
//            if (minThroughput < 100) {
        if (minThroughput != maxThroughput) {
            targetMode = 2;
        }

        log("targetMode = "+targetMode+", minThroughput = "+minThroughput+", maxThroughput = "+maxThroughput);


        // calculate end of current run
        // calculate end of phases
        var end = -1;
        for (var key in phasesToProcess) {
            var phase = phasesToProcess[key];
            var effectiveThroughput = phase['throughput'] * 100 / maxThroughput;
            log(" - throughput = "+phase['throughput']+", effectiveThroughput = "+effectiveThroughput);
            var phaseEnd = phase['start'] + phase['amount'] * 100 / effectiveThroughput;
            if (targetMode == 1 || end == -1) {
                end = Math.max(end, phaseEnd);
            }
            if (targetMode == 2) {
                end = Math.min(end, phaseEnd);
            }
        }
        if (end == -1) { // this should not happen
            end = 0;
        }
        log("natural end = " + end);

        // cut end with start of remaining phases
        var endDidChange = true;
        while (endDidChange) {
            endDidChange = false;
            var offset = end;// * 100 / maxThroughput - end;
            for (var key in sequences) {
				var sequence = sequences[key];
				var phases = sequence['phases'];
                if (phases.length > 0) {
                    var phase = phases[0];
//                        var start = phase.start - offset;
                    var start = phase['start'] * maxThroughput / 100;
                    if (start < end) {
                        log("end "+end+" -> "+start+", phase.start = "+phase['start']+", offset = "+offset);
                        end = start;
                        endDidChange = true;
                        break;
                    }
                }
            }
        }
        log("cuted end = " + end);

        // cut phases
        var offset = end * 100 / maxThroughput;
        for (var key in phasesToProcess) {
            var sequence = sequences[key];
            var phase = phasesToProcess[key];
            var amount = Math.min(phase['amount'], end);
            if (targetMode == 2) {
                var effectiveThroughput = phase['throughput'] * 100 / maxThroughput;
                amount = end * effectiveThroughput / 100;
            }
            var remainingAmount = phase['amount'] - amount;
            log("amount = "+phase['amount']+", cutting = "+amount+", remaining = "+remainingAmount);
            if (remainingAmount > 0) {
//                    var remainingPhase = new Phase(end, remainingAmount, phase.throughput);
				var remainingPhase = {
					start: offset,
					amount: remainingAmount,
					throughput: phase['throughput']
				}
                // var remainingPhase = new Phase(offset, remainingAmount, phase.throughput);
                // fixme: this is ugly
                // remainingPhase.sequence = sequence;
                sequence['phases'] = [remainingPhase].concat(sequence['phases']);
            }
            phase['amount'] = Math.min(phase['amount'], amount);
        }

        // move remaining phases by end
        log("moving offset = "+offset);
        for (var key in sequences) {
			var sequence = sequences[key];
			var phases = sequence['phases'];
            phases.forEach(function(phase) {
                log("finally moving phase with start "+phase['start']+" to "+(phase['start'] - offset));
                phase['start'] -= offset;
            })
        }

        // handle pauses
        var pause = -1;
        for (var key in sequences) {
			var sequence = sequences[key];
			var phases = sequence['phases'];
            if (phases.length > 0) {
                var phase = phases[0];
                if (pause == -1) {
                    pause = phase['start'];
                } else {
                    pause = Math.min(pause, phase['start']);
                }
            }
        }

        // move remaining phases by pause
        if (pause > 0) {
            for (var key in sequences) {
				var sequence = sequences[key];
				var phases = sequence['phases'];
                phases.forEach(function(phase) {
                    log("moving phase by pause with start "+phase['start']+" to "+(phase['start'] - pause));
                    phase.start -= pause;
                })
            }
        } else {
            pause = 0;
        }
        
        // setup line
        var jsonLine = {};
        var jsonComponents = [];
        var pauseMs = pause / amountPerMillisecond;
        log("line timing = "+targetMode+", sleep = "+pauseMs);
        jsonLine['timing'] = targetMode;
        jsonLine['sleep'] = pauseMs;
        for (var key in phasesToProcess) {
            var sequence = sequences[key];
            var ingredientId = sequence["ingredient-id"];
            var phase = phasesToProcess[key];
            var jsonComponent = {};
            jsonComponent['ingredient'] = ingredientId;
            jsonComponent['amount'] = phase['amount'];
            jsonComponents.push(jsonComponent);
            log(" - ingredient = "+ingredientId+", amount = "+phase['amount']);
            var phaseEnd = phase['start'] + phase['amount'] * 100 / phase['throughput'];
            end = Math.max(end, phaseEnd);
        }
        jsonLine['components'] = jsonComponents;
        jsonLines.push(jsonLine);
        // check if phases available
        phasesAvailable = false;
        for (var key in sequences) {
			var sequence = sequences[key];
			var phases = sequence['phases'];
            if (phases.length > 0) {
                phasesAvailable = true;
                break;
            }
        }
    }
    var jsonRecipe = {};
    jsonRecipe['lines'] = jsonLines;
    convertedJson['recipe'] = jsonRecipe;
    return convertedJson;
}


module.exports = self;