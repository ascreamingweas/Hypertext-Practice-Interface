<html>
    <body>
        <?php
            $uploaddir = 'json/';
            $uploadfile = $uploaddir . basename($_FILES['userfile']['name']);

            echo '<pre>';
            if (move_uploaded_file($_FILES['userfile']['tmp_name'], $uploadfile)) {
                echo "File is valid, and was successfully uploaded.\n";
            } else {
                echo "Possible file upload attack!\n";
            }

            echo 'Here is some more debugging info:';
            print_r($_FILES);

            print "</pre>";
        ?>
        <br>
        <button onclick="history.go(-1);">Back</button>
    </body>
</html>