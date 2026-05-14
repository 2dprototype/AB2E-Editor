var sceneManager = Editor.sceneManager;
var bodies = sceneManager.selectedBodies;

var m = 0;

for (var i = 0; i < bodies.length; i++){
    m += bodies[i].get_properties().m_mass;
}

ref.terminal.println('total bodies : ' + bodies.length);
ref.terminal.println(m);
ref.terminal.show();