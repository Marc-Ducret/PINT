require(["jquery", "materialize.sideNav", "materialize.global"],
    function () {
        $(".button-collapse-left").sideNav();
        $(".button-collapse-right").sideNav({
            edge: 'right'
        });
    }
);