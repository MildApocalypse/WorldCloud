/**
 * finds the inclusive cells covered by a length centered on a point, accounting for odd or even numbers
 * @param center point length is centered on
 * @param length distance of range either side of point
 * @returns the beginning and end of the range, inclusive
 */
export function getRange(center: number, length: number): [number, number]{
    const i = Math.floor(center);
    const span = length/2;
    return [i-Math.ceil(span)+1, i+Math.floor(span)];
}

/**
 * adds a random amount to the angle, smaller amounts when the angle is more horizontal
 * @param angle angle to add to
 * @returns new angle
 */
export function incrementAngle(angle: number): number{
    return angle + toRadians(Math.random() * 10 + 30*(Math.abs(Math.sin(angle))));
}

export const toRadians = (degrees: number) => degrees * (Math.PI / 180);
export const toDegrees = (radians: number) => radians * (180 / Math.PI);