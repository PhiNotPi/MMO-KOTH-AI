var timer1 = 0;
var timer2 = 0;
var timer3 = 0;
var timer4 = 0;
var timer5 = 0;

var guard = null; //require('guard');

var rand = Math.random();
var upgradeCount = 0
var upgradeTankCount = 0;;
var gatherCount = 0;
var mineCount = 0;
var buildCount = 0;
var demoCount = 0;
var voyageCount = 0;
//Game.spawns.Spawn1.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK],'guard' +rand,{roles:['guard'],num:rand});
//Game.spawns.Spawn1.createCreep([TOUGH,TOUGH,TOUGH,MOVE,HEAL],'healer2',{roles:['heal','flee']});
//Game.spawns.Spawn1.createCreep([TOUGH,TOUGH,TOUGH,MOVE,HEAL],'healer1',{roles:['heal','flee']});

for (var i in Memory.creeps) {
  if (!Game.creeps[i]) {
    delete Memory.creeps[i];
  }
}

var closestDropped = Game.spawns.Spawn1.pos.findClosest(FIND_DROPPED_ENERGY, {
  filter: function(e) {
    return e.energy > 10
  }
});

for (var name in Game.creeps) {
  var creep = Game.creeps[name];
  creep.memory.claimed = false;
}


timer4 -= Game.getUsedCpu();
//if(false){
for (var rid in Game.rooms) {
  var curRoom = Game.rooms[rid];
  var energies = curRoom.find(FIND_DROPPED_ENERGY);
  for (var en in energies) {
    var drop = energies[en];
    var near = drop.pos.findClosest(FIND_MY_CREEPS, {
      filter: function(c) {
        return c.memory.roles[0] == 'gather' && c.energy == 0 && !(c.memory.claimed)
      }
    });
    //var near =drop.room.find(FIND_MY_CREEPS,{filter:function(c){return c.memory.roles[0] == 'gather' && c.energy == 0 && !(c.memory.claimed)}});
    if (near) {
      near.moveTo(drop);
      near.pickup(drop);
      near.memory.claimed = true;
    } else {
      var nears = Game.rooms['W1N1'].find(FIND_MY_CREEPS, {
        filter: function(c) {
          return c.memory.roles[0] == 'gather' && c.energy == 0 && !(c.memory.claimed)
        }
      });
      if (nears.length) {
        nears[0].moveTo(creep.pos.findClosest(creep.room.findExitTo(drop.room.name)));
        nears[0].pickup(drop);
        nears[0].memory.claimed = true;
      }

    }
  }
}
//}
timer4 += Game.getUsedCpu();


for (var name in Game.creeps) {
  if (Game.getUsedCpu() > 290) {
    console.log("ra" + (timer1) + ", act" + timer2 + ", role" + timer3 + ", upg" + timer4 + ", gath" + timer5);
    return;
  }
  //creep.say(creep.memory.roles[0]);
  var creep = Game.creeps[name];
  if (creep.memory.claimed == null) {
    creep.memory.claimed = false;
  }
  //creep.memory.claimed = true;
  if (creep.memory.hCount == null) {
    creep.memory.hCount = creep.body.filter(function(part) {
      return part.type == HEAL;
    }).length;
  }
  if (creep.memory.aCount == null) {
    creep.memory.aCount = creep.body.filter(function(part) {
      return part.type == ATTACK;
    }).length;
  }
  if (creep.memory.raCount == null) {
    creep.memory.raCount = creep.body.filter(function(part) {
      return part.type == RANGED_ATTACK;
    }).length;
  }
  if (creep.memory.cCount == null) {
    creep.memory.cCount = creep.body.filter(function(part) {
      return part.type == CARRY;
    }).length;
  }
  if (creep.memory.wCount == null) {
    creep.memory.wCount = creep.body.filter(function(part) {
      return part.type == WORK;
    }).length;
  }
  var hCount = creep.memory.hCount;
  var hVal = 0;
  var rhVal = 0;
  var needsHealed = null;
  if (hCount) {
    needsHealed = creep.pos.findClosest(FIND_MY_CREEPS, {
      filter: function(a) {
        return a.hits < a.hitsMax;
      }
    });
    var dist = creep.pos.getRangeTo(needsHealed);
    if (dist <= 1) {
      hVal = 12 * hCount;
    }
    if (dist <= 3) {
      rhVal = 4 * hCount;
    }
  }


  var aCount = creep.memory.aCount;
  var aVal = 0;
  var aTarget = null;
  if (aCount) {
    var aTargets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
    if (aTargets) {
      aVal = 30 * aCount;
    }
    aTarget = aTargets[0];
  }


  var raCount = creep.memory.raCount;
  var raVal = 0;
  var rmaVal = 0;
  var raTarget = null;
  if (raCount) {
    var ops = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
    if (ops.length) {
      raTarget = creep.pos.findClosest(FIND_HOSTILE_CREEPS);
      raVal = 10 * raCount;
      for (var op in ops) {
        var dist = creep.pos.getRangeTo(ops[op]);
        rmaVal += ((1.5 * dist - 10.5) * dist + 19) * raCount;
      }
    }
  }

  var cCount = creep.memory.cCount;
  var wCount = creep.memory.wCount;


  timer2 -= Game.getUsedCpu();
  //var target = creep.pos.findClosest(FIND_HOSTILE_CREEPS);
  var isHealing = false;
  var damage = 0;
  var healage = 0;
  if (aVal) {
    creep.attack(aTarget);
    damage += aVal;
  } else if (hVal) {
    creep.heal(needsHealed);
    healage += hVal;
    isHealing = true;
  }
  if (rmaVal > raVal) {
    creep.rangedMassAttack();
    damage += rmaVal;
  } else if (raVal) {
    creep.rangedAttack(raTarget);
    damage += raVal;
  } else if (rhVal && !isHealing) {
    creep.rangedHeal(needsHealed);
    healage += rhVal;
    isHealing = true;
  }
  //if(damage){creep.say("d" + damage);}
  //else if(healage){creep.say("h" + healage);}
  timer2 += Game.getUsedCpu();

  timer3 -= Game.getUsedCpu();
  for (var role in creep.memory.roles) {
    if (creep.memory.roles[role] == 'guard') {
      guard(creep);
    } else {
      var tempGatherer = false;
      if (creep.memory.roles[role] == 'upgrade') {
        timer1 -= Game.getUsedCpu();
        upgradeCount++;
        //creep.suicide();
        if (creep.room.controller.pos.findInRange(FIND_MY_CREEPS, 1).length == 2) {
          var target = Game.spawns.Spawn1;
          if (creep.energy) {
            target = creep.room.controller;
            var dist = creep.pos.getRangeTo(creep.room.controller);
            if (dist > 3) {
              creep.moveTo(target);
            } else {
              var tanks = creep.pos.findInRange(FIND_MY_CREEPS, 4, {
                filter: function(a) {
                  return a.memory.roles[0] == 'upgradeTank';
                }
              });
              creep.moveTo(tanks[0]);
            }
            var ahead = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
              filter: function(a) {
                return (a.memory.roles[0] == 'upgrade' || a.memory.roles[0] == 'upgradeTank') && a.pos.getRangeTo(creep.room.controller) < dist && a.energy < a.energyCapacity;
              }
            });
            creep.transferEnergy(ahead[0]);
          } else if (Game.spawns.Spawn1.energy >= 3000) {
            if (creep.fatigue == 0) {
              creep.moveTo(Game.spawns.Spawn1);
            }
            Game.spawns.Spawn1.transferEnergy(creep);
          } else {
            ahead = creep.pos.findClosest(FIND_MY_CREEPS, {
              filter: function(a) {
                return a.memory.roles[0] == 'gather'
              }
            });
            if (ahead) {
              ahead.transferEnergy(creep);
            }
            creep.moveTo(Game.flags.Flag1);
          }
        } else {
          tempGatherer = true;
        }
        timer1 += Game.getUsedCpu();
      }
      if (creep.memory.roles[role] == 'gather' || tempGatherer == true) {
        gatherCount++;
        //var target = getNearestSpawn(creep);
        timer5 -= Game.getUsedCpu();
        if (!creep.memory.claimed) {
          if (creep.energyCapacity == creep.energy) {
            var spawn = Game.spawns.Spawn1;
            if (spawn.energy < 6000) {
              creep.moveTo(spawn);
              creep.transferEnergy(spawn);
              creep.memory.claimed = false;
            } else {
              var target = creep.room.find(FIND_MY_STRUCTURES, {
                filter: function(s) {
                  return s.energy < s.energyCapacity
                }
              });
              if (target.length) {
                creep.moveTo(target[0]);
                creep.transferEnergy(target[0]);
                creep.memory.claimed = false;
              }
            }
          } else {
            creep.moveTo(creep.pos.findClosest(FIND_DROPPED_ENERGY));
            creep.pickup(creep.pos.findInRange(FIND_DROPPED_ENERGY, 1)[0]);
          }
        }
        timer5 += Game.getUsedCpu();
      }

      if (creep.memory.roles[role] == 'upgradeTank') {
        upgradeTankCount++;


        target = creep.room.controller;
        creep.moveTo(target);
        //creep.suicide();
        creep.upgradeController(target);
        //var dist = creep.pos.getRangeTo(creep.room.controller);
        var ahead = creep.pos.findInRange(FIND_MY_CREEPS, 2, {
          filter: function(a) {
            return a.memory.roles[0] == 'upgrade' && a.energy;
          }
        });
        if (ahead.length) {
          ahead[0].moveTo(creep);
          ahead[0].transferEnergy(creep);
        }

      }
      if (creep.memory.roles[role] == 'mine') {
        mineCount++;
        //if(mineCount > 2){creep.suicide()}
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.memory.target == null) {
          creep.memory.target = 1;
        }
        if (creep.memory.tRoom == null) {
          creep.memory.tRoom = 'W1N1';
        }
        if (creep.room.name == creep.memory.tRoom) {
          if ((creep.energy < creep.energyCapacity || creep.energyCapacity == 0) && sources[creep.memory.target].energy > 0) {
            creep.moveTo(sources[creep.memory.target]);
            creep.harvest(sources[creep.memory.target]);
          }
        } else {
          creep.moveTo(creep.pos.findClosest(creep.room.findExitTo(creep.memory.tRoom)));
        }
      }
      if (creep.memory.roles[role] == 'build') {
        buildCount++;
        if (creep.energy) {
          var target = creep.pos.findClosest(FIND_CONSTRUCTION_SITES);
          if (target) {
            creep.moveTo(target);
            creep.build(target);
          } else {
            creep.moveTo(Game.flags.Flag1);
          }
        } else {
          creep.moveTo(Game.spawns.Spawn1);
          Game.spawns.Spawn1.transferEnergy(creep);
          var ahead = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function(a) {
              return (a.memory.roles[0] == 'gather') && a.energy >= a.energyCapacity;
            }
          });
          if (ahead.length) {
            ahead[0].transferEnergy(creep);
          }
        }
      }
      if (creep.memory.roles[role] == 'demo') {
        demoCount++;
        var target = creep.room.lookForAt('structure', 32, 24);
        if (target) {
          creep.moveTo(target);
          creep.attack(target);
        }
      }
      if (creep.memory.roles[role] == 'voyage') {
        voyageCount++;
        var dest = 'W4S2';
        if (creep.room.name != dest) {
          console.log(creep.room.findExitTo(dest));
          creep.moveTo(creep.pos.findClosest(creep.room.findExitTo(dest)));
        } else {
          creep.moveTo(creep.room.controller);
        }
      }
    }
  }
  timer3 += Game.getUsedCpu();

  creep.memory.claimed = false;
}


if (mineCount < 5) {
  Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, WORK, MOVE], 'miner4', {
    roles: ['mine'],
    target: 4,
    tRoom: 'E1N1'
  });
  Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, WORK, MOVE], 'miner5', {
    roles: ['mine'],
    target: 4,
    tRoom: 'E1N1'
  });
  Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, WORK, MOVE], 'miner1', {
    roles: ['mine'],
    target: 1
  });
  Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, WORK, MOVE], 'miner2', {
    roles: ['mine'],
    target: 1
  });
  Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, WORK, MOVE], 'miner3', {
    roles: ['mine'],
    target: 0
  });
} else if (gatherCount < 20) {
  Game.spawns.Spawn1.createCreep([CARRY, MOVE, CARRY, CARRY, MOVE], 'gatherer' + rand, {
    roles: ['gather']
  });
} else if (voyageCount < 1) {
  Game.spawns.Spawn1.createCreep([MOVE], 'Voyager', {
    roles: ['voyage']
  });
} else if (demoCount < 0) {
  Game.spawns.Spawn1.createCreep([ATTACK, ATTACK, ATTACK, MOVE, MOVE], 'demolisher' + rand, {
    roles: ['demo']
  });
} else if (buildCount < 0) {
  Game.spawns.Spawn1.createCreep([CARRY, CARRY, MOVE, WORK, WORK], 'builder' + rand, {
    roles: ['build']
  });
} else if (upgradeTankCount < 2) {
  Game.spawns.Spawn1.createCreep([CARRY, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], 'upgraderTank' + rand, {
    roles: ['upgradeTank']
  });
} else if (upgradeCount < 25) {
  Game.spawns.Spawn1.createCreep([CARRY, MOVE, CARRY, MOVE, CARRY], 'upgrader' + rand, {
    roles: ['upgrade']
  });
}

console.log("ra" + (timer1) + ", act" + timer2 + ", role" + timer3 + ", upg" + timer4 + ", gath" + timer5);
