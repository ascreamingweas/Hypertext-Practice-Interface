<html>
    <body>
        Your variable file has been submitted successfully!<br>

        <?php
            $str = file_get_contents('php://input');
            $myfile = fopen("json/test.txt", "w") or die("Unable to open file!");
            fwrite($myfile, $str);
            fclose($myfile);
            echo "File writing complete.";
        ?>
    </body>
</html>