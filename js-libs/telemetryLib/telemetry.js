/**
 * this is the Telemetry Interface
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

(function() {
    this.Telemetry = function() {};

    Telemetry.isActive = false;
    Telemetry.config = undefined;
    
    this.startTime = 0;
    this._defaultValue = {
        pdata:{
            id: "genie",
            var: "6.5.2567",
            pid: ""
        },
        channel: "in.ekstep",
        uid: "anonymous",
        did: "",
        authtoken: "",
        sid: "",
        batchsize: 20,
        mode: "play",
        host: "https://api.ekstep.in",
        endpoint: "/data/v3/telemetry",
        tags: [],
        cdata: [],
        apislug: "/action"
    }

    this.init = function(config, contentId, contentVer){
        Telemetry._defaultValue.gdata = {
            "id": contentId,
            "ver": contentVer
        }
        Telemetry.config = Object.assign(config, Telemetry._defaultValue);
        console.log("Telemetry config ", Telemetry.config);
    }

    Telemetry.start = function(config, contentId, contentVer, type, data) {
        init(config, contentId, contentVer);
        
        var startEventObj = getEvent('OE_START', data);

        // Required to calculate the time spent of content while generating OE_END
        startTime = startEventObj.ets;
    }

    this.hasRequiredData= function(data, mandatoryFields) {
        var isValid = true;
        mandatoryFields.forEach(function(key) {
            if (!data.hasOwnProperty(key)) isValid = false;
        });
        return isValid;
    }

    Telemetry.impression= function(pageid, type, subtype, data) {
        if (!this.hasRequiredData(data, ["pageid", "type"])) {
            console.error('Invalid impression data');
            return;
        }
        var eksData = {
            "stageid": pageid,
            "stageto": (data && data.stageto) ? data.stageto : "",
            "type": type,
            "subtype": subtype ? subtype : ""
        };
        getEvent('OE_NAVIGATE', eksData);
    }

    Telemetry.interact= function(data) {
        if (!this.hasRequiredData(data, ["type", "id"])) {
            console.error('Invalid interact data');
            return;
        }
        var eksData = {
            "stageid": data.extra.stageId ? data.extra.stageId.toString() : "",
            "type": data.type,
            "subtype": data.extra.subtype ? data.extra.subtype : "",
            "pos": data.extra.pos ? data.extra.pos : [],
            "id": data.id,
            "tid": data.extra.tid ? data.extra.tid : "",
            "uri": data.extra.uri ? data.extra.uri : "",
            "extype": "",
            "values": data.extra.values ? data.extra.values : []
        };
        getEvent('OE_INTERACT', eksData);
    }

    Telemetry.startAssessment= function(qid, data) {
        if (undefined == qid){
            console.error('Invalid interact data');
            return;
        }
        var eksData = {
            qid: qid,
            maxscore: maxscore
        };
        return this.getEvent('OE_ASSESS', eksData);
    },

    Telemetry.endAssessment= function(assessStartEvent, data) {
        if (!this.hasRequiredData(data, ["qtitle", "qdesc", "mmc", "mc"])) {
            console.error('Invalid end assessment data');
            return;
        }
        if (undefined == assessStartEvent) {
            console.error('Invalid end assessment data');
            return;
        }
        assessStartEvent.event.edata.eks.resvalues = Array.isArray(assessStartEvent.event.edata.eks.resvalues ? assessStartEvent.event.edata.eks.resvalues.map(function(val) {
            val = ("object" == typeof val) ? val :{"0" : val};
            return val;
        }); : [];

        var endeks = Object.assign(assessStartEvent.event.edata.eks, {
            "score": data.score || 0,
            "pass": data.pass ? 'Yes' : 'No',
            "resvalues": isEmpty(data.res)? [] : data.res,
            "uri": data.uri || "",
            "qindex": data.qindex || 0,
            "exlength": 0,
            "qtitle": data.qtitle,
            "qdesc": data.qdesc.substr(0,140),
            "mmc": data.mmc,
            "mc": data.mc
            "length": Math.round(((new Date()).getTime() - assessStartEvent.event.ets ) / 1000);
        })
        this.getEvent('OE_ASSESS', endeks);
    }

    Telemetry.response= function(data) {
        if (!this.hasRequiredData(data, ["target", "qid", "type"])) {
            console.error('Invalid response data');
            return;
        }
        var eksData = {
            "target": data.target,
            "qid": data.qid,
            "type": data.type,
            "state": data.state || "",
            "resvalues": isEmpty(data.values) ? [] : data.values
        }
        getEvent('OE_ITEM_RESPONSE', eksData);
    }
    
    Telemetry.interrupt= function(data) {
        if (!this.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        var eksData = {
            "type": data.type,
            "stageid": data.pageid || ''
        }
        getEvent('OE_INTERRUPT', eksData);
    }
    
    Telemetry.error= function(data) {
        if (!this.hasRequiredData(data, ["err", "errtype"])) {
            console.error('Invalid error data');
            return;
        }
        var eksData = {
            "err": data.err, 
            "type": data.errtype,
            "env": data.env || '', 
            "stacktrace": data.stacktrace, 
            "stageid": data.stageId || '', 
            "objecttype": data.objectType || '', 
            "objectid": data.objectId || '', 
            "action": data.action || '', 
            "data": data.data || '', 
            "severity": data.severity || ''
        }
        getEvent('OE_ERROR', eksData);
    }

    Telemetry.end= function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.end(data));
    }

    Telemetry.exdata= function(type, data) {
        getEvent('OE_XAPI', {
            "xapi": data
        });
    }
    
    Telemetry.assess= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.feedback= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.share= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.log= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.search= function(data) {
        console.log("This method comes in V3 release");
    }

    this.flushEvent= function(event, apiName) {
        Telemetry._data.push(event);
        if (event)
            event.flush(apiName);
        return event;
    }

    getEvent= function(eventId, data) {
        var eventObj = {
            "eid": eventId,
            "ver": 2.2,
            "mid": "",
            "ets": (new Date()).getTime(),
            "channel": Telemetry.config.channel,
            "pdata": Telemetry.config.pdata,
            "gdata": Telemetry.config.gdata,
            "cdata": Telemetry.config.cdata, //TODO: No correlation data as of now. Needs to be sent by portal in context
            "uid": Telemetry.config.uid, // uuid of the requester
            "sid": Telemetry.config.sid,
            "did": Telemetry.config.did,
            "edata": { "eks": data },
            "etags": {
                "tags": Telemetry.config.tags
            }
          }
          console.log("Event Type" + eventId, eventObj);
        return eventObj;
    }

    return Telemetry;
})();
