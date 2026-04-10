const poguSkaits = document.querySelectorAll(".drum").length

for (let i = 0; i < poguSkaits; i++) {

document.querySelectorAll(".drum")[i].addEventListener("click", function() {
    alert("Man uzklikšķināja!")
})
}