
````
backend
app.post("/join", async (req, res) => {
    const id = escapeHtml(req.body.id);
    const username = escapeHtml(req.body.username);
    const email = req.body.email;
    const password = req.body.password;
    const gender = req.body.gender;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const sql = "INSERT INTO users (id, username, email, password, gender, regdate) VALUES (?, ?, ?, ?, ?, ?)";
  try {
        // Check membership registration information validity
        if (!id || !username || !email || !password || !gender) {
            res.sendStatus(400);
            return; // If validation fails, terminate the function immediately
       }
       // Confirm ID duplication
       const checkQuery = "SELECT * FROM users WHERE id = ?";
       const [existingUser] = await pool.execute(checkQuery, [id]);
       if (existingUser.length > 0) {
           res.sendStatus(409);
           return; // If ID is duplicated, function terminates immediately
      }
      /** Add account upon successful membership registration */
    await pool.execute(sql, [id, username, email, hash, gender, new Date()]);
    // Save user ID to session
    req.session.userID = id;
    // Save ID in session
    req.session.id = req.sessionID;
    res.redirect("/");
    } catch (err) {
    console.error(err); // Database error output
    res.status(500).send({ err: "An error occurred on the server." });
  }
});
Page
<!DOCTYPE html> 
      <html lang="ko"> 
      <head> 
          <meta charset="UTF-8"> 
          <title>회원가입</title> 
  
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" > 
          <link rel="stylesheet" href="css/custom.css"> 
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" </script> 
      <script src="js/custom.js"></script> 
</div> 
<script> 
document.querySelector("form").addEventListener("submit", function (event) { 
    event.preventDefault(); 
    var formData = new FormData(document.querySelector("form")); 
    var xhr = new XMLHttpRequest(); 
    xhr.open("POST", "/join", true); 
    xhr.onload = function () { 
        if (xhr.status >= 200 && xhr.status < 300) { 
            window.location.href = "/"; 
          } else if (xhr.status === 400) {  
            const errorMessage = xhr.response ? JSON.parse(xhr.response).err : "입력이 안된 사항이 있습니다."; 
            document.getElementById("error-message").textContent = errorMessage; 
          } else if (xhr.status === 409) { 
            const errorMessage = xhr.response ? JSON.parse(xhr.response).err : "존재하는 아이디 입니다."; 
            document.getElementById("error-message").textContent = errorMessage; 
          } else { 
            console.error("서버 오류:", xhr.status, xhr.statusText); 
       } 
  }; 
  xhr.onerror = function () { 
      console.error("네트워크 오류"); 
  }; 
  xhr.send(formData); 
}); 
</script> 
      </head> 
      <body> 
          
        <nav id="navbar-example2" class="navbar bg-body-tertiary px-3 mb-3"> 
          <ul class="nav nav-pills"> 
              <li> 
                <a class="nav-link" id='action' href="/">메인</a> 
              </li> 
              <li> 
                <a class="nav-link" id='action1' href="/bbs">게시판</a> 
              </li> 
              <li> 
                <a class="nav-link" id='action2' href="/Notice">공지사항</a> 
              </li> 
              <li> 
                <a class="nav-link" id='action3' href="/list">구매하기</a> 
              </li> 
              <% if(id === 'admin'){ %> 
                  <li> 
                  <a class="nav-link" id='action4' href="/admin">관리자 페이지</a> 
                </li> 
              <% } %> 
              
              
              <% if (!id) { %> 
                  <li class="nav-item dropdown"> 
                    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">접속하기</a> 
                    <ul class="dropdown-menu"> 
                        <li><a class="dropdown-item" href="/login">로그인</a></li> 
                        <li><a class="dropdown-item" href="/join">회원가입</a></li> 
                    </ul> 
                  </li> 
                  </ul> 
                  <% } else { %> 
                  <li class="nav-item dropdown"> 
                    <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">회원관리</a> 
                    <ul class="dropdown-menu"> 
                      <li><a class="dropdown-item" href="/updatepage/<%= pid %>">회원수정</a></li> 
                        <li><a class="dropdown-item" href="/profile/<%= pid %>">마이페이지</a></li> 
                        <li><hr class="dropdown-divider"></li> 
                        <li><a class="dropdown-item" href="/logout">로그아웃</a></li> 
                    </ul> 
                  </li> 
                  </ul> 
                <% } %> 
        </ul> 
          </nav> 
          
```
          <section class="bg-light"> 
            <div class="container py-4"> 
                <div class="row align-items-center justify-content-between"> 
                
                        <span class="text-dark h4" style="text-align: center;">회원가입</span>               
                </div> 
                <form action="/join" method="post"> 
                    <div class="form-group"> 
                        <input type="text" class="form-control" name="id" aria-describedby="emailHelp" placeholder="아이디"> 
                    </div> 
                    <br> 
            <div class="form-group"> 
              <input type="password" class="form-control is-valid" name="password" placeholder="비밀번호"> 
            </div> 
            <br> 
          
                    <div class="form-group"> 
                        <input type="text" class="form-control" aria-describedby="emailHelp" name="username" placeholder="이름"> 
                    </div> 
                    <br> 
                    <div class="form-group"> 
                      <select class="form-select" id="exampleSelect1" name="gender"> 
                        <option>남자</option> 
                        <option>여자</option> 
                        <option>공개안함</option> 
                      </select> 
                    </div> 
                    <br> 
              <div class="form-group"> 
                 <input type="email" class="form-control" aria-describedby="emailHelp" name="email" placeholder="이메일"> 
             </div> 
            <div class="d-grid gap-2"> 
                        <input class="btn btn-success btn-arrow-left form-control" type="submit" value="회원가입"> 
    
                </form> 
            </div> 
            <div id="error-message" class="text-danger"></div> 
            <h5>이미 회원이신가요?</h5> 
            <a href="/login">로그인 화면</a> 
            </div> 
        </section> 
      </body> 
      </html> `
```
