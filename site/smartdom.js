// store local
function storeLocal(key, content) {
  localStorage.setItem(key, JSON.stringify(content));
}

// get local
function getLocal(key, def) {
  const stored = localStorage.getItem(key);

  if (!stored) return def;

  try {
    const blob = JSON.parse(stored);

    return blob;
  } catch (err) {
    return def;
  }
}

// smartdom base element
class SmartdomElement_ {
  // delete childs
  x() {
    this.html("");
    return this;
  }

  // add event listener
  ae(kind, callback) {
    this.e.addEventListener(kind, callback);
    return this;
  }

  // set from state
  setFromState(state) {
    // abstract
    return this;
  }

  // get stored state
  getStoredState(def) {
    if (this.storePath) {
      return getLocal(this.storePath, null);
    } else {
      return def || null;
    }
  }

  // get state
  getState() {
    return this.getStoredState();
  }

  // store state
  storeState(state) {
    if (this.storePath) {
      storeLocal(this.storePath, state || this.getState());
    }

    return this;
  }

  // set store path
  sp(path) {
    this.storePath = path;
    return this.setFromState(this.getStoredState());
  }

  // set attribute
  sa(key, value) {
    this.e.setAttribute(key, value);
    return this;
  }

  // remove attribute
  ra(key, value) {
    this.e.removeAttribute(key, value);
    return this;
  }

  // value
  value(value) {
    this.e.value = value;
    return this;
  }

  // id
  id(id) {
    return this.sa("id", id).sa("name", id);
  }

  // flatten props
  flattenProps(props) {
    // a terminal is something that is not an array
    if (!Array.isArray(props)) return props;

    let accum = [];

    for (let prop of props) {
      if (Array.isArray(prop)) {
        // flatten array
        for (let item of prop) {
          accum = accum.concat(this.flattenProps(item));
        }
      } else {
        accum.push(prop);
      }
    }

    return accum;
  }

  constructor(tag, ...props) {
    // create dom element from tag, default = div
    this.e = document.createElement(tag || "div");

    // props
    this.props = props || [];

    // flatten props
    this.props = this.flattenProps(this.props);

    // string props
    this.stringProps = [];

    // other props
    this.otherProps = [];

    // sort out props
    for (let prop of this.props) {
      if (typeof prop == "string") {
        this.stringProps.push(prop);
      } else {
        this.otherProps.push(prop);
      }
    }

    // config
    this.config = this.otherProps[0] || {};

    // add all string props as classes
    for (let sprop of this.stringProps) {
      this.ac(sprop);
    }
  }

  // add classes
  ac(...classes) {
    // add classes to element classList
    for (let klass of this.flattenProps(classes)) {
      this.e.classList.add(klass);
    }

    return this;
  }

  // remove classes
  rc(...classes) {
    // remove classes from element classList
    for (let klass of this.flattenProps(classes)) {
      this.e.classList.remove(klass);
    }

    return this;
  }

  // add style
  as(key, value) {
    this.e.style[key] = value;

    return this;
  }

  // add style in px
  aspx(key, value) {
    return this.as(key, value + "px");
  }

  // set innerHTML
  html(content) {
    this.e.innerHTML = content;
    return this;
  }

  // append childs
  a(...childs) {
    for (let child of this.flattenProps(childs)) {
      this.e.appendChild(child.e);
    }
    return this;
  }

  // drag over behavior
  dragover(delay) {
    this.ae("dragover", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.ac("dragover");
      if (this.dragoverTimeout) {
        clearTimeout(this.dragoverTimeout);
        this.dragoverTimeout = null;
      }
      this.dragoverTimeout = setTimeout(
        (_) => this.rc("dragover"),
        delay || 1000
      );
    });

    return this;
  }
}

// drop image element
class DropImage_ extends SmartdomElement_ {
  constructor(...props) {
    super("div", props);
    this.ac("dropimage").dragover();
    this.ae("mouseout", (_) => this.rc("dragover"));
    this.ae("mouseover", (_) => this.ac("dragover"));
    this.ae("drop", this.drop.bind(this));
    this.width(150).height(150);
  }

  width(w) {
    this.width = w;
    this.aspx("width", w);
    return this;
  }

  height(h) {
    this.height = h;
    this.aspx("height", h);
    return this;
  }

  setFromState(state) {
    if (state) {
      this.as("background-image", `url(${state.url})`).as(
        "background-size",
        "100% 100%"
      );
    }

    return this;
  }

  setDropCallback(callback) {
    this.dropCallback = callback;
    return this;
  }

  drop(e) {
    e.stopPropagation();
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        const b64 = btoa(result);
        const parts = file.name.split(".");
        const ext = parts[parts.length - 1];
        parts.pop();
        const name = parts.length ? parts.join(".") : "";
        reader.onload = (e) => {
          const url = e.target.result;
          const state = {
            b64: b64,
            url: url,
            fullName: file.name,
            name: name,
            ext: ext,
            size: result.length,
          };
          this.storeState(state).setFromState(state);
          if (this.dropCallback) {
            this.dropCallback(state);
          }
        };
        reader.readAsDataURL(file);
      };
      reader.readAsBinaryString(file);
    }
  }
}
function DropImage(...props) {
  return new DropImage_(props);
}

// div element
class div_ extends SmartdomElement_ {
  constructor(...props) {
    super("div", props);
  }
}
function div(...props) {
  return new div_(props);
}

// option element
class option_ extends SmartdomElement_ {
  constructor(value, display, ...props) {
    super("option", props);
    this.e.value = value;
    this.html(display);
  }

  selected(value) {
    value ? this.sa("selected", true) : this.ra("selected");

    return this;
  }
}
function option(value, display, ...props) {
  return new option_(value, display, props);
}

// select element
class select_ extends SmartdomElement_ {
  constructor(...props) {
    super("select", props);
    this.options = [];
    this.ae("input", this.input.bind(this));
  }

  input() {
    console.log(this.e);
    this.storeState({
      keyvalues: this.keyvalues,
      selected: this.e.value,
    });
  }

  setFromState(state) {
    if (state) {
      this.setOptions(state.keyvalues, state.selected);
    }

    return this;
  }

  setOptionsFromList(values, selected) {
    return this.setOptions(values.map((value) => [value, value], selected));
  }

  setOptions(keyvalues, selected) {
    this.keyvalues = keyvalues || null;
    this.selected = selected || this.keyvalues[0][0] || null;

    this.x();

    if (keyvalues.length) {
      this.options = this.keyvalues.map((keyvalue) =>
        option(keyvalue[0], keyvalue[1]).selected(keyvalue[0] == this.selected)
      );

      this.a(this.options);
    }

    this.storeState({
      keyvalues: this.keyvalues,
      selected: this.selected,
    });

    return this;
  }
}
function select(...props) {
  return new select_(props);
}

// table element
class table_ extends SmartdomElement_ {
  constructor(...props) {
    super("table", props);
  }
}
function table(...props) {
  return new table_(props);
}

// table row element
class tr_ extends SmartdomElement_ {
  constructor(...props) {
    super("tr", props);
  }
}
function tr(...props) {
  return new tr_(props);
}

// table cell element
class td_ extends SmartdomElement_ {
  constructor(...props) {
    super("td", props);
  }
}
function td(...props) {
  return new td_(props);
}

// checkbox element
class CheckBox_ extends SmartdomElement_ {
  constructor(...props) {
    super("input", props);
    this.sa("type", "checkbox");
    this.ae("input", this.input.bind(this));
    this.ac("checkbox");
  }

  getState() {
    return {
      checked: this.isChecked(),
    };
  }

  setChecked(value) {
    this.e.checked = value;

    return this;
  }

  isChecked() {
    return this.e.checked;
  }

  setFromState(state) {
    if (state) {
      return this.setChecked(state.checked);
    }

    return this;
  }

  input() {
    this.storeState(this.getState());
  }
}
function CheckBox(...props) {
  return new CheckBox_(props);
}

// hidden input
class hidden_ extends SmartdomElement_ {
  constructor(id) {
    super("input");
    this.sa("type", "hidden");
    this.id(id);
  }
}
function hidden(id) {
  return new hidden_(id);
}

// br element
class br_ extends SmartdomElement_ {
  constructor(...props) {
    super("br", props);
  }
}
function br(...props) {
  return new br_(props);
}

// labeled element
class Labeled_ extends SmartdomElement_ {
  constructor(label, content, props) {
    super("div", props);
    this.ac("labeled").as("display", "inline-block");
    this.a(
      div()
        .as("display", "flex")
        .as("align-items", "center")
        .a(
          (this.labelDiv = div().html(label).ac("label")),
          (this.contentDiv = div()
            .a(content.ac("contentelement"))
            .ac("content"))
        )
    );
  }
}
function Labeled(label, content, props) {
  return new Labeled_(label, content, props);
}

// text input element
class TextInput_ extends SmartdomElement_ {
  constructor(...props) {
    super("input", props);
    this.sa("type", "text");
    this.ac("textinput");
    this.ae("input", this.input.bind(this));
  }

  getState() {
    const value = this.e.value;

    return {
      value: value,
    };
  }

  input() {
    this.storeState();
  }

  setFromState(state) {
    if (state) {
      this.e.value = state.value;
    }

    return this;
  }
}
function TextInput(...props) {
  return new TextInput_(props);
}

// text input element
class TextArea_ extends SmartdomElement_ {
  constructor(...props) {
    super("textarea", props);
    this.ac("textarea");
    this.ae("input", this.input.bind(this));
  }

  getState() {
    const value = this.e.value;

    return {
      value: value,
    };
  }

  input() {
    this.storeState();
  }

  setFromState(state) {
    if (state) {
      this.e.value = state.value;
    }

    return this;
  }
}
function TextArea(...props) {
  return new TextArea_(props);
}

// button element
class button_ extends SmartdomElement_ {
  constructor(callback, ...props) {
    super("button", props);
    this.ac("button");
    if (callback) this.ae("click", callback);
  }
}
function button(callback, ...props) {
  return new button_(callback, props);
}

// submit element
class Submit_ extends SmartdomElement_ {
  constructor(caption, ...props) {
    super("input", props);
    this.sa("type", "submit");
    this.ac("submit");
    this.value(caption);
  }
}
function Submit(caption, ...props) {
  return new Submit_(caption, props);
}

// form element
class form_ extends SmartdomElement_ {
  constructor(...props) {
    super("form", props);
    this.ac("form");
  }

  action(action) {
    this.sa("action", action);
    return this;
  }

  blank() {
    this.sa("target", "_blank");
    return this;
  }

  method(method) {
    this.sa("method", method);
    return this;
  }

  post() {
    return this.method("post");
  }
}
function form(...props) {
  return new form_(props);
}

// log item element
class LogItem_ extends SmartdomElement_ {
  constructor(...props) {
    super("div", props);

    // determine record properties, supply reasonable default
    this.record = this.config.record || {};

    if (typeof this.record == "string") {
      try {
        this.record = JSON.parse(this.record);
      } catch (err) {
        this.record = {
          msg: this.record,
        };
      }
    }

    // set record defaults
    this.record.time = this.record.time || new Date().getTime();
    this.record.msg = this.record.msg || this.record.toString();

    this.level = this.record.level || "Raw";

    this.timeDiv = div("time").html(
      this.record.timeFormatted ||
        this.record.naiveTime ||
        new Date(this.record.time).toLocaleString()
    );
    this.moduleDiv = div("module").html(this.record.modulePath || "");
    this.levelDiv = div("level").html(this.level);
    this.msgDiv = div("msg").html(this.record.msg);
    this.fileDiv = div("file").html(this.record.file || "");
    this.msgContainerDiv = div("messagecont").a(this.msgDiv, this.fileDiv);

    this.ac("logitem", this.level.toLowerCase());

    this.timeAndModuleDiv = div("timeandmodule").a(
      this.timeDiv,
      this.moduleDiv
    );

    this.container = div()
      .as("display", "flex")
      .as("align-items", "center")
      .a(this.timeAndModuleDiv, this.levelDiv, this.msgContainerDiv);

    this.as("display", "inline-block").a(this.container);
  }
}
function LogItem(...props) {
  return new LogItem_(props);
}

// logger
class Logger_ extends SmartdomElement_ {
  constructor(...props) {
    super("div", props);

    this.ac("log");

    this.config = {
      capacity: this.config.capacity || 250,
      delay: this.config.delay || 1000,
    };

    this.items = [];

    this.as("display", "inline-block");

    this.build();

    this.hasNew = true;

    setInterval(this.checkLastBuilt.bind(this), 100);
  }

  checkLastBuilt() {
    if (!this.hasNew) return false;

    const now = new Date().getTime();

    const elapsed = now - this.lastBuilt;

    const fire = elapsed > this.config.delay && this.hasNew;

    if (fire) {
      this.build();

      this.hasNew = false;
    }

    return fire;
  }

  build() {
    this.x().a(this.items);

    this.lastBuilt = new Date().getTime();
  }

  add(item) {
    this.items.unshift(item);

    while (this.items.length > this.config.capacity) {
      this.items.pop();
    }

    this.hasNew = true;

    this.checkLastBuilt();
  }
}
function Logger(...props) {
  return new Logger_(props);
}
