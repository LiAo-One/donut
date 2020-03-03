window.onload = function () {
    // 基准地址
    axios.defaults.baseURL = 'http://localhost:8080/donut/';
    // 相应拦截器
    axios.interceptors.response.use(function (res) {
        return res.data;
    }, function (error) {
        console.log(error)
    });
    let config = {
        //添加请求头
        headers: {"Content-Type": "multipart/form-data"},
        //添加上传进度监听事件
        onUploadProgress: e => {
            var completeProgress = ((e.loaded / e.total * 100) | 0) + "%";
            this.progress = completeProgress;
        }
    };
    var table = new Vue({
        el: '#user_tables',
        data: {
            user: '',        // 存储user列表
            isActive: false,  // 控制导航栏样式
            updateUser: {
                id: '',
                account: '',
                password: '',
                roles: '',
                name: '',
                sex: '',
                age: '',
                email: '',
                status: '',
                img: ''
            },
            seeionUser: {
                id: '',
                account: '',
                password: '',
                roles: '',
                name: '',
                sex: '',
                age: '',
                email: '',
                status: '',
                img: ''
            },
            pagination: {
                pageNum: '1',     // 当前页数
                userName: ''
            },
            userImg: ''
        },
        methods: {
            // 数据回填事件
            dataBackfill: function (user) {
                this.updateUser.id = user.id;
                this.updateUser.account = user.userAccount;
                this.updateUser.password = user.userPassword;
                this.updateUser.roles = user.userRoles;
                this.updateUser.name = user.userName;
                this.updateUser.sex = user.userSex;
                this.updateUser.email = user.userEmail;
                this.updateUser.status = user.userStatus;
                this.updateUser.img = user.headImg;
            },
            // Session 数据回填事件
            sessionUserBack: function (user) {
                this.seeionUser.id = user.id;
                this.seeionUser.account = user.userAccount;
                this.seeionUser.password = user.userPassword;
                this.seeionUser.roles = user.userRoles;
                this.seeionUser.name = user.userName;
                this.seeionUser.sex = user.userSex;
                this.seeionUser.email = user.userEmail;
                this.seeionUser.status = user.userStatus;
                this.seeionUser.img = user.headImg;
            },
            //获取当前用户登录Session事件
            obtainlLoginUserSerssion: async function () {
                var rejson = await axios.post("user/obtainloginuser")
                if (!rejson.bool) {
                    // 用户未登录
                    spop({
                        template: '用户身份过期，请重新登录',
                        group: 'submit-satus',
                        style: 'error',
                        autoclose: 2000
                    });
                    setTimeout(function () {
                        window.location.href = 'http://localhost:8080/donut/html/login&registered.html';
                    }, 2000)
                } else {
                    // 回填数据方法
                    this.sessionUserBack(rejson.list[0])
                    if (rejson.list[0].headImg != null) {
                        this.userImg = "http://localhost:8080/donut/uploads/" + rejson.list[0].headImg;
                    }
                    console.log(rejson.list[0].headImg)
                    console.log("我是Seeion 头像" + this.userImg)
                }
            },
            // 更改左侧导航栏样式
            changeNavigation: function () {
                if (this.isActive) {
                    this.isActive = false;
                } else {
                    this.isActive = true;
                }

            },
            // 列表加载事件
            queryDate: async function () {
                // var ret = await axios.post('user/selectall');
                // this.user = ret.data.list;
                var params = new URLSearchParams();
                params.append('userName', this.pagination.userName);
                params.append('pn', this.pagination.pageNum)
                var rejsons = await axios.post('user/selectall', params);
                this.user = rejsons.data;
            },
            // 修改图标单击事件
            popup: function (user) {
                // 回填数据事件
                this.dataBackfill(user);
                // 弹出框事件
                $('#itemUser').popup({
                    time: 1000,
                    classAnimateShow: 'flipInX',
                    classAnimateHide: 'hinge',
                    onPopupClose: function e() {
                        // console.log('0')
                    },
                    onPopupInit: function e() {
                        // console.log('1')
                    }
                });
            },
            // 确认修改按钮
            updateUserEvent: async function (type) {
                var params = new URLSearchParams();
                var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                // 当前用户修改
                if (type) {
                    params.append('id', this.seeionUser.id);
                    params.append('userName', this.seeionUser.name);
                    params.append('userRoles', this.seeionUser.roles);
                    params.append('userSex', this.seeionUser.sex);
                    params.append('userEmail', this.seeionUser.email);
                    params.append('userStatus', this.seeionUser.status);
                    params.append('headImg', this.seeionUser.img);
                    // 执行修改
                    if (!reg.test(this.seeionUser.email)) {
                        // 邮箱校验失败
                        spop({
                            template: '邮箱校验失败',
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                        return;
                    }
                    ;
                    if (this.seeionUser.id == null) {
                        spop({
                            template: '用户ID为空',
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                        return;
                    }
                    // 执行修改
                    var updateUser = await axios.post('user/updateUser', params);
                    console.log(updateUser);
                    if (updateUser.bool) {
                        spop({
                            template: updateUser.message,
                            group: 'submit-satus',
                            style: 'success',
                            autoclose: 2000
                        });
                        this.queryDate();
                        spop({
                            template: '即将跳转到登录',
                            group: 'submit-satus',
                            style: 'success',
                            autoclose: 2000
                        });
                        setTimeout(function () {
                            window.location.href = 'http://localhost:8080/donut/html/login&registered.html';
                        }, 2000)
                    } else {
                        spop({
                            template: updateUser.message,
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                    }
                    // 普通用户修改
                } else {
                    params.append('id', this.updateUser.id);
                    params.append('userName', this.updateUser.name);
                    params.append('userRoles', this.updateUser.roles);
                    params.append('userSex', this.updateUser.sex);
                    params.append('userEmail', this.updateUser.email);
                    params.append('userStatus', this.updateUser.status);
                    params.append('headImg', this.updateUser.img);
                    // 执行修改
                    if (!reg.test(this.updateUser.email)) {
                        // 邮箱校验失败
                        spop({
                            template: '邮箱校验失败',
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                        return;
                    }
                    ;
                    if (this.updateUser.id == null) {
                        spop({
                            template: '用户ID为空',
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                        return;
                    }
                    // 执行修改
                    var updateUser = await axios.post('user/updateUser', params);
                    console.log(updateUser);
                    if (updateUser.bool) {
                        spop({
                            template: updateUser.message,
                            group: 'submit-satus',
                            style: 'success',
                            autoclose: 2000
                        });
                        this.queryDate();
                    } else {
                        spop({
                            template: updateUser.message,
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                    }
                }
            },
            // 翻页
            pageTurning: function (type) {
                if (type) {
                    // 下一页
                    if (this.pagination.pageNum < this.user.pages) {
                        this.pagination.pageNum++;
                        this.queryDate();
                    } else {
                        spop({
                            template: '已经是最后一页',
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                    }
                } else {
                    // 下一页
                    if (this.pagination.pageNum != 1) {
                        this.pagination.pageNum--;
                        this.queryDate();
                    } else if (this.pagination.pageNum == 1) {
                        spop({
                            template: '已经是第一页',
                            group: 'submit-satus',
                            style: 'error',
                            autoclose: 2000
                        });
                    }
                }
            },
            // 修改当前登录用户信息
            loginUserDataUpdate: function () {
                $('#itemLogin').popup({
                    time: 1000,
                    classAnimateShow: 'flipInX',
                    classAnimateHide: 'hinge',
                    onPopupClose: function e() {
                        // console.log('0')
                    },
                    onPopupInit: function e() {
                        // console.log('1')
                    }
                });
            },
            // 头像上传单击事件
            choosAvatar: function () {
                // document.getElementById("fileImg").click();
                $("#fileImg").trigger("click");

            },
            // 选择头像事件
            async specifiName(event) {
                var formData = new FormData();
                // var params = new URLSearchParams();
                formData.append("file", event.target.files[0]);
                if (event.target.files[0].name != null) {
                    // 执行图片上传
                    var userImgUpload = await axios.post("file/uploadFile", formData, config);
                    console.log(userImgUpload);
                    if (userImgUpload.fileName != null) {
                        // 头像上传成功
                        this.userImg = '';
                        this.updateUser.img = userImgUpload.fileName;
                        this.userImg = "http://localhost:8080/donut/uploads/" + userImgUpload.fileName;
                        console.log(this.updateUser.img)
                    }
                } else {
                    spop({
                        template: '头像为空',
                        group: 'submit-satus',
                        style: 'error',
                        autoclose: 2000
                    });
                }
            },
        },
        computed: {},
        filters: {
            // 过滤时间
            date(time) {
                let date = new Date(time)//把定义的时间赋值进来进行下面的转换
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let hour = date.getHours();
                let minute = date.getMinutes();
                let second = date.getSeconds();
                return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
            }
        },
        mounted: function () {
            // axios.post("user/selectall").then( (res) => {
            //     this.user = res.data.list;
            //     console.log("===================")
            //     console.log(that.user);
            // })
            // 调用请求后台数据方法
            this.queryDate();
            // 获取Session
            this.obtainlLoginUserSerssion();
        }
    })
}