<?php

  $url = 'https://api.sendgrid.com/';
  $user = 'IF_mail';
  $pass = 'yLh6_foodistasty_q!WfT]7a';

  $subject_email = 'Kipthis.com Message';
  $text_email = '<h3>Hi! here\'s a message</h3> <br> From: ' . $_POST['name'] . ' at ' . $_POST['company'] . '   <br><br><b>Message</b><br>  ' . json_decode($_POST['formText']) . ' <br><br> Their email address: ' . $_POST['email'];

  $params = array(
      'api_user'  => $user,
      'api_key'   => $pass,
      'to'        => 'hello@interfacefoundry.com',
      'subject'   => $subject_email,
      'html'      => $text_email,
      'text'      => $text_email,
      'from'      => $_POST['email'],
    );

  $request =  $url.'api/mail.send.json';

  // Generate curl request
  $session = curl_init($request);
  // Tell curl to use HTTP POST
  curl_setopt ($session, CURLOPT_POST, true);
  // Tell curl that this is the body of the POST
  curl_setopt ($session, CURLOPT_POSTFIELDS, $params);
  // Tell curl not to return headers, but do return the response
  curl_setopt($session, CURLOPT_HEADER, false);
  // Tell PHP not to use SSLv3 (instead opting for TLS)
  curl_setopt($session, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
  curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

  // obtain response
  $response = curl_exec($session);
  curl_close($session);

  // print everything out
  print_r($response);


  // //*****************************************************
  // $your_site_name = "___";              // please change!
  // $your_email = "noreply@noreply.no";   // please change!
  // //*****************************************************

  // // post vars
  // $the_msg = isset($_POST['msg']) ? trim($_POST['msg']) : "";
  // $the_mail = isset($_POST['mail']) ? trim($_POST['mail']) : "";
  // $the_name = isset($_POST['name']) ? trim($_POST['name']) : "";

  // // check post values
  // if (strlen($the_msg) < 1 || strlen($the_mail) < 1 || strlen($the_name) < 1) {
  //   $error['strlen'] = true;
  // }

  // if (preg_match('/[a-z0-9&\'\.\-_\+]+@[a-z0-9\-]+\.([a-z0-9\-]+\.)*+[a-z]{2,4}/im', $the_mail, $matches)) {
  //   $the_mail = $matches[0];
  // } else {
  //   $error['email'] = true;
  // }

  // if (!isset($error)) {

  //   // no errors! good! you may add here special contact functional.

  //   // an email example:
  //   $header  = "MIME-Version: 1.0\r\n";
  //   $header .= "Content-type: text/html; charset=utf-8\r\n";
  //   $header .= "From: {$the_name} <{$the_mail}>\r\n";

  //   //   to       subject               message       header
  //   $result = mail($your_email, "Message from ".$your_site_name, nl2br($the_msg), $header);
  // }
?>
<p><strong>Thank you</strong>. Your Message has been Sent.</p>
<p>We will respond to you shortly if your message requires a response.</p>
