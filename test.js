document.addEventListener('DOMContentLoaded', function() {
    const button= document.getElementById('log');
    button.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default action of the button
        console.log('Button was clicked!');
    });
    const form = document.getElementById('LoginForm');
    form.addEventListener('submit', function(event) {

        event.preventDefault();
        console.log('Form submitted!');

    });

});