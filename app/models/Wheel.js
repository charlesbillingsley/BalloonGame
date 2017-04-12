/**
 * Created by christopherfracassi on 4/10/17.
 */
class Wheel {
    constructor (numSpokes) {
        const WHEEL_RADIUS = 200;
        const TIRE_THICKNESS = 20;
        const tubeGeo = new THREE.TorusGeometry(WHEEL_RADIUS,TIRE_THICKNESS, 6, 30);
        const tubeMat = new THREE.MeshPhongMaterial({color: 0xFF00FF});
        const tube = new THREE.Mesh(tubeGeo, tubeMat);

        const WheelGroup = new THREE.Group();
        WheelGroup.add(tube);

        for (let k = 0; k < numSpokes; k++){
            const spGeo = new THREE.CylinderGeometry (0.7 * TIRE_THICKNESS, 0.7 * TIRE_THICKNESS,
            WHEEL_RADIUS, 10, 10);

            const spMat = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
            const sp = new THREE.Mesh(spGeo, spMat);

            sp.rotateZ(k * 2 * Math.PI / numSpokes);
            sp.translateY (WHEEL_RADIUS / 2);
            WheelGroup.add(sp);
        }

        return WheelGroup;
    }
}
