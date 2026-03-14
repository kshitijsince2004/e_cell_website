<?php
$firstn = filter_var($_POST['firstn'], FILTER_SANITIZE_STRING);
$lastn = filter_var($_POST['lastn'], FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$phone = filter_var($_POST['phone'], FILTER_SANITIZE_STRING);
$services = filter_var($_POST['services'], FILTER_SANITIZE_STRING);
$message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Invalid email format!");
}

$formcontent="First Name: $firstn \n Last Name: $lastn \n Email: $email \n Services: $services \n Phone: $phone \n Message: $message";

$recipient = getenv('CONTACT_EMAIL') ?: "ecellnfsutc@gmail.com";
$subject = "Contact Form";

$mailheader = "From: noreply@" . $_SERVER['SERVER_NAME'] . "\r\n";
$mailheader .= "Reply-To: $email\r\n";

if(mail($recipient, $subject, $formcontent, $mailheader)) {
    require_once "thank-you.html";
} else {
    die("Error!");
}
?>