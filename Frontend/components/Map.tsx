import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

interface MyMapProps {
    position: [number, number];
    zoom: number;
}

export default function MyMap(props: MyMapProps) {
    const { position, zoom } = props

    return (
        <MapContainer 
            center={position} 
            zoom={zoom} 
            scrollWheelZoom={true}
            style={{ height: "400px", width: "100%", borderRadius: "12px" }}
        >
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    Nagpur, Maharashtra <br /> The Orange City
                </Popup>
            </Marker>
        </MapContainer>
    )
}