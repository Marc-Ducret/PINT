describe('User interface', function () {
    it('initializes the canvas correctly', function() {
        jasmine.getFixtures().fixturesPath = "build";
        jasmine.getStyleFixtures().fixturesPath = "build";
        loadFixtures('index.html');
        loadStyleFixtures('main.css');

        initializeWebapplication();

        var canvas = document.getElementById('layer1');
        var context = canvas.getContext('2d');

        var imgData = context.getImageData(0,0,1,1).data;
        expect(imgData[0]).toBe(255);
        expect(imgData[1]).toBe(255);
        expect(imgData[2]).toBe(255);
    });
});