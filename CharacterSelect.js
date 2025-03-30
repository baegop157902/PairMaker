document.addEventListener('DOMContentLoaded', function () {
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    
    const leftCharacterInfo = document.querySelector('.left-character-info');
    const rightCharacterInfo = document.querySelector('.right-character-info');

    if (leftButton.checked) {
        leftCharacterInfo.style.display = 'block';
        rightCharacterInfo.style.display = 'none';
    }

    leftButton.addEventListener('change', function() {
        if (leftButton.checked) {
            leftCharacterInfo.style.display = 'block';
            rightCharacterInfo.style.display = 'none';
        }
    });

    rightButton.addEventListener('change', function() {
        if (rightButton.checked) {
            leftCharacterInfo.style.display = 'none';
            rightCharacterInfo.style.display = 'block';
        }
    });
});
