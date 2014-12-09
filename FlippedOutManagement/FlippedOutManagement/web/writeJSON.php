<html>
    <body>
        Your JSON has been submitted successfully!<br>

        <?php
            $str_json = file_get_contents('php://input');
            $myfile = fopen("json/code.json", "w") or die("Unable to open file!");
            fwrite($myfile, $str_json);
            fclose($myfile);
            echo "File writing complete.";
        ?>
    </body>
</html>