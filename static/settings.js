let titlebarKeys = Object.keys(titlebarThemes)

for (let i = 0; i < uiThemes.length; i++) {
    let newOption = document.createElement("option");
    newOption.value = uiThemes[i];
    newOption.text = uiThemes[i];
    document.getElementById("uistyle").appendChild(newOption);
};

for (let key of titlebarKeys) {
  let newOption = document.createElement("option");
  newOption.value = key;
  newOption.text = key;
  document.getElementById("titlebarStyle").appendChild(newOption);
}

function applySettings() {
    uiStyle = document.getElementById("uistyle").value;
    localStorage.setItem("uiStyle", uiStyle);
    titlebarStyle = document.getElementById("titlebarStyle").value;
    localStorage.setItem("titlebarStyle", titlebarStyle);
    titlebarFormat = titlebarThemes[document.getElementById("titlebarStyle").value];
    localStorage.setItem("titlebarFormat", titlebarFormat);
    location.reload()
}