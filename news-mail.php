<?php
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Invalid email format!");
}

$formcontent="Email: $email";
$recipient = getenv('CONTACT_EMAIL') ?: "ecellnfsutc@gmail.com";
$subject = "Newslater Form";

$mailheader = "From: noreply@" . $_SERVER['SERVER_NAME'] . "\r\n";
$mailheader .= "Reply-To: $email\r\n";

if(mail($recipient, $subject, $formcontent, $mailheader)) {
    require_once "thank-you.html";
} else {
    die("Error!");
}
?>