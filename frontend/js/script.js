$(document).ready(function() {
    $('.navbar li').click(function(e) {
        var $this = $(this);
        var toSlide = $this.data('container');
        $('.navbar li.active').removeClass('active');
        if (!$this.hasClass('active')) {
            $this.addClass('active');
        }
        $('.section').not('#' + toSlide).slideUp(250);
        setTimeout(function() {
            $('#' + toSlide).slideDown(250);
        }, 300);
        e.preventDefault();
    });

    if (sessionStorage.getItem('email'))
    {
        $('#userShow').html('User email: ' + sessionStorage.getItem('email'));
        $('#userShow').slideDown();
    }

    if (sessionStorage.getItem('token'))
    {
        $('#tokenShow').html('API access token: <pre>' + sessionStorage.getItem('token') + '</pre>');
        $('#tokenShow').slideDown();
    }

    /*
    USERS
    */
    function getToken(email, password) {
        $('#tokenShow').slideUp();
        var resourceUrl = '/api/auth';
        $.ajax({
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                'email': email,
                'password': password
            }),
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    // Got token
                    sessionStorage.setItem('token', data.token);
                    $('#tokenShow').html('API access token: <pre>' + data.token + '</pre>');
                    $('#tokenShow').slideDown();

                    sessionStorage.setItem('email', email);
                    $('#userShow').html('User email: ' + email);
                    $('#userShow').slideDown();
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function checkToken() {
        if (sessionStorage.getItem('token')) {
            $.ajaxSetup({
                beforeSend: function(jqXHR, settings) {
                    jqXHR.setRequestHeader('x-access-token', sessionStorage.getItem('token'));
                }
            });
        }
        else {
            $.ajaxSetup({
                beforeSend: function(jqXHR, settings) {
                    jqXHR.setRequestHeader('x-access-token', "");
                }
            });
        }
    }

    function getUsers() {
        // Empty table
        $rows = $('#userRows');
        $rows.empty();
        var resourceUrl = '/api/users';

        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    var users = data.response;
                    console.log('Fetched ' + users.length + ' users');
                    for (userIndex in users) {
                        user = users[userIndex];
                        var source = $("#userRow-template").html();
                        var template = Handlebars.compile(source);
                        var context = { id: user._id, email: user.email, roles: user.roles.join(', ')};
                        var rowHtml = template(context);
                        $rows.append(rowHtml);
                        setButtonHandlers();
                    }
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function appendUser(id) {
        var resourceUrl = '/api/users/' + id;
        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    var user = data.response;
                    var source = $('#userRow-template').html();
                    var template = Handlebars.compile(source);
                    var context = { id: user._id, email: user.email, roles: user.roles.join(', ')};
                    var rowHtml = template(context);
                    $rows.append(rowHtml);
                    setButtonHandlers();
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function createUser(usrEmail, usrPwd) {
        var resourceUrl = '/api/users';
        $.ajax({
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                email: usrEmail,
                password: usrPwd
            }),
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    appendUser(data.newUserID);
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function getUser(id, callback) {
        var resourceUrl = '/api/users/' + id;
        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    callback(data.response);
                }
                else {
                    alert(data.reponse);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function editUser(id, newEmail, newPwd) {
        checkToken();
        var resourceUrl = '/api/users/' + id;
        $.ajax({
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                email: newEmail,
                password: newPwd
            }),
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    // Edited successfully.
                    alert(data.response);
                    getUsers();
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function removeUser(id) {
        var sure = confirm('Are you sure you want to delete user ' + id + '?');
        if (!sure) return;

        checkToken();
        var resourceUrl = '/api/users/' + id;
        $.ajax({
            method: "DELETE",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    // Removed
                    getUsers();
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function getUserPosts(id, callback) {
        var resourceUrl = '/api/users/' + id + '/posts';
        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    callback(data.response);
                }
                else {
                    alert(data.reponse);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function setButtonHandlers() {
        $('.btn-usr-details').off("click").click(function() {
            $button = $(this);
            var usrId = $(this).data('for-usr-id');
            getUser(usrId, function(data) {
                var user = data;
                var source = $('#userDetail-template').html();
                var template = Handlebars.compile(source);
                var context = { id: user._id, email: user.email, roles: user.roles.join(', ')};
                var detailsHtml = template(context);
                $('#userBasicInfo').html(detailsHtml);
            });
            getUserPosts(usrId, function(data) {
                var posts = data;
                console.log(posts);
                var source = $('#userPosts-template').html();
                var template = Handlebars.compile(source);
                var context = { num: posts.length, posts: posts };
                var detailsHtml = template(context);
                $('#userPostsInfo').html(detailsHtml);
            });
        });
        $('.btn-usr-edit').off("click").click(function() {
            var usrId = $(this).data('for-usr-id');
            getUser(usrId, function(data) {
                $('#editUsrIdSpan').html(data._id);
                $('#editUsrId').val(data._id);
                $('#editUsrEmail').val(data.email);
            });
        });
        $('.btn-usr-remove').off("click").click(function() {
            var usrId = $(this).data('for-usr-id');
            removeUser(usrId);
        });
    }

    $('#editUser').click(function() {
        editUser($('#editUsrId').val(), $('#editUsrEmail').val(), $('#editUsrPwd').val());
    });

    $('#createUser').click(function() {
        createUser($('#newUsrEmail').val(), $('#newUsrPwd').val());
    });

    $('#loginUser').click(function() {
        getToken($('#loginUsrEmail').val(), $('#loginUsrPwd').val())
    });

    /*
    POSTS
    */
    function getPosts() {
        // Empty table
        $rows = $('#postRows');
        $rows.empty();
        var resourceUrl = '/api/posts';

        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    var posts = data.response;
                    console.log('Fetched ' + posts.length + ' posts');
                    for (postIndex in posts) {
                        post = posts[postIndex];
                        var source = $("#postRow-template").html();
                        var template = Handlebars.compile(source);
                        var context = { id: post._id, title: post.title, date: post.date, byuser: post.byUser };
                        var rowHtml = template(context);
                        $rows.append(rowHtml);
                        setButtonHandlersPosts();
                    }
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function appendPost(id) {
        var resourceUrl = '/api/posts/' + id;
        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    post = data.response;
                    var source = $("#postRow-template").html();
                    var template = Handlebars.compile(source);
                    var context = { id: post._id, title: post.title, data: post.date, byuser: post.byUser };
                    var rowHtml = template(context);
                    $rows.append(rowHtml);
                    setButtonHandlersPosts();
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function createPost(postTitle, postContent) {
        checkToken();
        var resourceUrl = '/api/posts';
        $.ajax({
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                title: postTitle,
                content: postContent
            }),
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    appendPost(data.newPostID);
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function getPost(id, callback) {
        var resourceUrl = '/api/posts/' + id;
        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    getUser(data.response.byUser, function(usr) {
                        data.response.byUserEmail = usr.email;
                        callback(data.response);
                    })
                }
                else {
                    alert(data.reponse);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function editPost(id, newTitle, newContent) {
        checkToken();
        var resourceUrl = '/api/posts/' + id;
        $.ajax({
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                title: newTitle,
                content: newContent
            }),
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    // Edited successfully.
                    alert(data.response);
                    getPosts();
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function removePost(id) {
        var sure = confirm('Are you sure you want to delete post ' + id + '?');
        if (!sure) return;

        checkToken();
        var resourceUrl = '/api/posts/' + id;
        $.ajax({
            method: "DELETE",
            contentType: "application/json",
            url: resourceUrl,
            success: function(data) {
                if (data.success == true) {
                    // Removed
                    getPosts();
                }
                else {
                    alert(data.response);
                }
            },
            error: function(data) {
                alert('Can not find resource at: ' + resourceUrl)
            }
        })
    }

    function setButtonHandlersPosts() {
        $('.btn-post-details').off("click").click(function() {
            $button = $(this);
            var postId = $(this).data('for-post-id');
            getPost(postId, function(data) {
                var post = data;
                var source = $('#postDetail-template').html();
                var template = Handlebars.compile(source);
                console.log(post);
                var context = { id: post._id, title: post.title, content: post.content, date: post.date, byuser: post.byUser, byuseremail: post.byUserEmail };
                var detailsHtml = template(context);
                $('#postDetailsContainer').html(detailsHtml);
            });
        });
        $('.btn-post-edit').off("click").click(function() {
            var postId = $(this).data('for-post-id');
            getPost(postId, function(data) {
                $('#editPostIdSpan').html(data._id);
                $('#editPostId').val(data._id);
                $('#editPostTitle').val(data.title);
                $('#editPostContent').val(data.content);
            });
        });
        $('.btn-post-remove').off("click").click(function() {
            var postId = $(this).data('for-post-id');
            removePost(postId);
        });
    }

    $('#editPost').click(function() {
        editPost($('#editPostId').val(), $('#editPostTitle').val(), $('#editPostContent').val());
    });

    $('#createPost').click(function() {
        createPost($('#newPostTitle').val(), $('#newPostContent').val());
    });

    getUsers();
    setTimeout(function() {
        getPosts();
    }, 0);
});
