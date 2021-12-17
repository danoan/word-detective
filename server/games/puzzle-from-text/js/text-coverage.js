let leftSlider = document.getElementById("text-coverage-left-range");
let rightSlider = document.getElementById("text-coverage-right-range");
let minGap = 0;
let sliderTrack = document.querySelector(".text-coverage-range-slider-track");
let sliderMaxValue = document.getElementById("text-coverage-left-range").max;

function fillColor(){
    let percent1 = (leftSlider.value / sliderMaxValue) * 100;
    let percent2 = (rightSlider.value / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, var(--pallete-6) ${percent1}% , var(--pallete-2) ${percent1}% , var(--pallete-2) ${percent2}%, var(--pallete-6) ${percent2}%)`;
}

export function updateLeftRange(){
    if(parseInt(rightSlider.value) - parseInt(leftSlider.value) <= minGap){
        leftSlider.value = parseInt(rightSlider.value) - minGap;
    }
    fillColor();
}

export function updateRightRange(){
    if(parseInt(rightSlider.value) - parseInt(leftSlider.value) <= minGap){
        rightSlider.value = parseInt(leftSlider.value) + minGap;
    }
    fillColor();
}

export function getLeftRangeValue(){
    return Number(leftSlider.value);
}

export function getRightRangeValue(){
    return Number(rightSlider.value);
}