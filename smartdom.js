class SmartdomElement_ {
    // delete childs
    x(){
        this.html("")
        return this
    }

    // set attribute
    sa(key, value){
        this.e.setAttribute(key, value)
        return this
    }

    // value
    value(value){
        this.e.value = value
        return this
    }

    // id
    id(id){
        return this.sa("id", id).sa("name", id)
    }

    flattenProps(props){        
        // a terminal is something that is not an array
        if(!Array.isArray(props)) return props

        let accum = []

        for(let prop of props){
            if(Array.isArray(prop)){
                // flatten array
                for(let item of prop){
                    accum = accum.concat(this.flattenProps(item))                    
                }
            }else{
                accum.push(prop)
            }
        }

        return accum
    }

    constructor(tag, ...props){
        // create dom element from tag, default = div
        this.e = document.createElement(tag || "div");

        // props
        this.props = props || []

        // flatten props
        this.props = this.flattenProps(this.props)

        // string props
        this.stringProps = []

        // other props
        this.otherProps = []

        // sort out props
        for(let prop of this.props){
            if(typeof prop == "string"){
                this.stringProps.push(prop)
            }else{
                this.otherProps.push(prop)
            }
        }

        // config
        this.config = this.otherProps[0] || {}

        // add all string props as classes
        for(let sprop of this.stringProps){
            this.ac(sprop)
        }
    }

    // add classes
    ac(...classes){
        // add classes to element classList
        for(let klass of this.flattenProps(classes)){
            this.e.classList.add(klass)
        }
        return this
    }

    // remove classes
    rc(...classes){
        // remove classes from element classList
        for(let klass of this.flattenProps(classes)){
            this.e.classList.remove(klass)
        }
    }

    // add style
    as(key, value){
        this.e.style[key] = value
        return this
    }

    // add style in px
    aspx(key, value){
        return this.as(key, value + "px")
    }

    // set innerHTML
    html(content){
        this.e.innerHTML = content
        return this
    }

    // append childs
    a(...childs){
        for(let child of this.flattenProps(childs)){
            this.e.appendChild(child.e)
        }
        return this
    }
}

// div element
class div_ extends SmartdomElement_{
    constructor(...props){
        super("div", props)
    }
}
function div(...props){return new div_(props)}

// hidden input
class hidden_ extends SmartdomElement_{
    constructor(id){
        super("input")
        this.sa("type", "hidden")
        this.id(id)
    }
}
function hidden(id){return new hidden_(id)}

// br element
class br_ extends SmartdomElement_{
    constructor(...props){
        super("br", props)
    }
}
function br(...props){return new br_(props)}

// labeled element
class Labeled_ extends SmartdomElement_{
    constructor(label, content, props){
        super("div", props)
        this.ac("labeled").as("display", "inline-block")
        this.a(
            div().as("display", "flex").as("align-items", "center").a(
                this.labelDiv = div().html(label).ac("label"),
                this.contentDiv = div().a(content.ac("contentelement")).ac("content")
            )            
        )
    }
}
function Labeled(label, content, props){return new Labeled_(label, content, props)}

// text input element
class TextInput_ extends SmartdomElement_{
    constructor(...props){
        super("input", props)
        this.sa("type", "text")
        this.ac("textinput")
    }
}
function TextInput(...props){return new TextInput_(props)}

// text input element
class TextArea_ extends SmartdomElement_{
    constructor(...props){
        super("textarea", props)        
        this.ac("textarea")
    }
}
function TextArea(...props){return new TextArea_(props)}

// text input element
class Submit_ extends SmartdomElement_{
    constructor(caption, ...props){
        super("input", props)
        this.sa("type", "submit")
        this.ac("submit")
        this.value(caption)
    }
}
function Submit(caption, ...props){return new Submit_(caption, props)}

// form element
class form_ extends SmartdomElement_{
    constructor(...props){
        super("form", props)
        this.ac("form")
    }

    action(action){
        this.sa("action", action)
        return this
    }

    blank(){
        this.sa("target", "_blank")
        return this
    }

    method(method){
        this.sa("method", method)
        return this
    }

    post(){
        return this.method("post")
    }
}
function form(...props){return new form_(props)}

// LogItem element
class LogItem_ extends SmartdomElement_{
    constructor(...props){
        super("div", props)

        // determine record properties, supply reasonable default
        this.record = this.config.record || {}

        if(typeof this.record == "string"){
            try{
                this.record = JSON.parse(this.record)
            }catch(err){
                this.record = {
                    msg: this.record
                }
            }            
        }

        // set record defaults
        this.record.time = this.record.time || new Date().getTime()
        this.record.msg = this.record.msg || this.record.toString()

        this.level = this.record.level || "Raw"

        this.timeDiv = div("time").html(this.record.timeFormatted || this.record.naiveTime || new Date(this.record.time).toLocaleString())
        this.moduleDiv = div("module").html(this.record.modulePath || "")        
        this.levelDiv = div("level").html(this.level)        
        this.msgDiv = div("msg").html(this.record.msg)
        this.fileDiv = div("file").html(this.record.file || "")
        this.msgContainerDiv = div("messagecont").a(this.msgDiv, this.fileDiv)

        this.ac("logitem", this.level.toLowerCase())

        this.timeAndModuleDiv = div("timeandmodule").a(this.timeDiv, this.moduleDiv)

        this.container = div().as("display", "flex").as("align-items", "center").a(this.timeAndModuleDiv, this.levelDiv, this.msgContainerDiv)

        this.as("display", "inline-block").a(this.container)
    }
}
function LogItem(...props){return new LogItem_(props)}

// LogItem element
class Logger_ extends SmartdomElement_{
    constructor(...props){
        super("div", props)

        this.ac("log")

        this.config = {
            capacity: this.config.capacity || 250,
            delay: this.config.delay || 1000,
        }

        this.items = []

        this.as("display", "inline-block")

        this.build()

        this.hasNew = true

        setInterval(this.checkLastBuilt.bind(this), 100)
    }

    checkLastBuilt(){
        if(!this.hasNew) return false

        const now = new Date().getTime()

        const elapsed = ( now - this.lastBuilt )

        const fire = ( elapsed > this.config.delay ) && this.hasNew

        if(fire){
            this.build()

            this.hasNew = false
        }

        return fire
    }

    build(){
        this.x().a(this.items)

        this.lastBuilt = new Date().getTime()
    }

    add(item){
        this.items.unshift(item)

        while(this.items.length > this.config.capacity){
            this.items.pop()
        }

        this.hasNew = true

        this.checkLastBuilt()
    }
}
function Logger(...props){return new Logger_(props)}