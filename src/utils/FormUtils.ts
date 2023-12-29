export const onNumericFieldChanged = (e: any) => {
    if (!["Backspace", "Tab", "End", "Home", "ArrowLeft", "ArrowRight"].includes(e.key) && isNaN(e.key)) {
        e.preventDefault();
    }
}