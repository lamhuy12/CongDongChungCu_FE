import DashboardLayout from "@/components/Layout/DashboardLayout.vue";
// GeneralViews
import NotFound from "@/components/Views/GeneralViews/NotFoundPage.vue";
// Dashboard pages
const Overview = () =>
  import(
    /* webpackChunkName: "widgets" */ "src/components/Views/Dashboard/Overview.vue"
  );
const Widgets = () =>
  import(
    /* webpackChunkName: "widgets" */ "src/components/Views/Dashboard/Widgets.vue"
  );




// authentication pages
import User from "@/components/Views/UserProfile/UserProfile.vue";
import Login from "@/components/Views/Auth/Login.vue";
// import Register from "@/components/Views/Auth/Register.vue";

// notification pages
import Notifications from "@/components/Views/Notification/NotificationHome.vue";
import NotificationDetail from "@/components/Views/Notification/NotificationDetail.vue";

// news page
import News from "@/components/Views/News/NewsHome.vue";
import NewsDetail from "@/components/Views/News/NewsDetail.vue";

//Account
const UserAccount = () =>
  import(
    /* webpackChunkName: "tables" */ "@/components/Views/Account/UserTables.vue"
  );
  const ResidentProfile = () =>
  import(
    /* webpackChunkName: "tables" */ "@/components/Views/Account/ResidentTables.vue"
  );

//POI
const POI = () =>
  import(
    /* webpackChunkName: "tables" */ "@/components/Views/POI/POITables.vue"
  );
const AddPOI = () =>
  import(/* webpackChunkName: "widgets" */ "@/components/Views/POI/AddPOI.vue");



//Post
const Post = () =>
  import(
    /* webpackChunkName: "tables" */ "@/components/Views/Post/PostTables.vue"
  );

  const PostContent = () =>
  import(
    /* webpackChunkName: "tables" */ "@/components/Views/Post/PostContent.vue"
  );




//Comment
const Comment = () =>
  import(
    /* webpackChunkName: "tables" */ "@/components/Views/Post/Comments.vue"
  );

// Apartments
const Apartment = () => import("@/components/Views/Apartment/Apartments.vue");

// Store Page
const Store = () => import("@/components/Views/Store/StoreTable.vue");
const StoreProduct = () => import("@/components/Views/Store/ProductTable.vue");

//

let notification = {
  path: "/notification",
  name: "Notification Page",
  component: DashboardLayout,
  redirect: "/notification/notification-home",
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: "notification-home",
      name: "Notifications",
      component: Notifications
    },
    {
      path: "notification-detail/:notiID",
      name: "Notification Detail",
      component: NotificationDetail
    },
  ]
};

let news = {
  path: "/news",
  name: "News Page",
  component: DashboardLayout,
  redirect: "/news/news-home",
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: "news-home",
      name: "News",
      component: News
    },
    {
      path: "news-detail/:newsID",
      name: "News Detail",
      component: NewsDetail
    },
  ]
};

let post = {
  path: "/post",
  name: "Post",
  component: DashboardLayout,
  redirect: "/post/post-home",
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: "post-home",
      name: "Posts",
      component: Post,
    },
    {
      path: "comment/:postId",
      name: "Comment",
      component: Comment
    },
    {
      path: "post-content/:postId",
      name: "Post content",
      component: PostContent
    }
  ]
};

let account = {
  path: "/users",
  name: "Account",
  component: DashboardLayout,
  redirect: "/users/users-home",
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: "users-home",
      name: "Users",
      component: UserAccount
    },
    {
      path: "resident-home/:userId",
      name: "Resident",
      component: ResidentProfile
    }
  ]
};


let poi = {
  path: "/poi",
  name: "POI",
  component: DashboardLayout,
  redirect: "/poi/poi-home",
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: "poi-home",
      name: "POI Homes",
      component: POI
    },
    {
      path: "poi-create",
      name: "POI Creation",
      component: AddPOI
    },
  ],
};

let apartment = {
  path: "/apartment",
  name: "Apartment",
  component: DashboardLayout,
  redirect: "/apartment/apartment-home",
  meta: {
    requiresAuth: true
  },
  children: [
    {
      path: "apartment-home",
      name: "Apartments",
      component: Apartment
    }
  ]
};

let store = {
  path: "/store",
  name: "Store",
  component: DashboardLayout,
  redirect: "/store/store-home",
  meta: { requiresAuth: true },
  children: [
    {
      path: "store-home",
      name: "Stores",
      component: Store
    },
    {
      path: "store-product/:storeID",
      name: "Store Product",
      component: StoreProduct
    }
  ]
};

let userProfile = {
  path: "/user",
  component: DashboardLayout,
  redirect: "/user/profile",
  meta: { requiresAuth: true },
  children: [
    {
      path: "profile",
      name: "User Profile",
      component: User
    }
  ]
};

let loginPage = {
  path: "/login",
  name: "Login",
  component: Login
};

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  loginPage,
  userProfile,
  notification,
  news,
  apartment,
  store,
  account,
  poi,
  post,
  {
    path: "/admin",
    component: DashboardLayout,
    redirect: "/admin/overview",
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: "overview",
        name: "Overview",
        meta: {
          requiresAuth: true
        },
        component: Overview
      },
      {
        path: "widgets",
        name: "Widgets",
        component: Widgets
      }
    ]
  },
  { path: "*", component: NotFound }
];

export default routes;