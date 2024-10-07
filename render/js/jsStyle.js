
function dragForResize(element, target, direction) {
    let isResizing = false;
    let vw = window.innerWidth/100
    let vh = window.innerHeight/100

    function onMouseMove(event) {
        const target_BoundingClientRect = target.getBoundingClientRect();
        if (direction === 'horizontal') {
            let mouseX = target_BoundingClientRect.width + event.movementX;
            let min = 50
            let max = 500
            if (mouseX < min){
                target.style.width = min + 'px'
            } else if (mouseX > max) {
                target.style.width = max + 'px'
            } else {
                target.style.width = mouseX + 'px';

            }
        } else if (direction === 'vertical') {
            let mouseY = target_BoundingClientRect.height + event.movementY;
            let min = 100*vh-300
            let max = 100*vh-50
            if (mouseY < min){
                target.style.height = min + 'px'
            } else if (mouseY > max) {
                target.style.height = max + 'px'
            } else {
                target.style.height = mouseY + 'px';

            }

        }
    }

    function clearEventListener() {
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', clearEventListener);
    }

    // 主体
    element.addEventListener('mousedown', () => {
        isResizing = true;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', clearEventListener);
    });
}


dragForResize(horizontalResizable, horizontalResizableFrame, "horizontal")
dragForResize(verticalResizable, verticalResizableFrame, "vertical")
