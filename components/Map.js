import * as React from "react"
import { Dimensions, StyleSheet, Text, View } from "react-native"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import MapView, { Callout, Circle, Marker } from "react-native-maps"
import * as Location from 'expo-location';
import { TouchableOpacity } from 'react-native';

export default function App() {
    const [location, setLocation] = React.useState(null);
    const [errorMsg, setErrorMsg] = React.useState(null);
    const [region, setRegion] = React.useState(null);
    const [pin, setPin] = React.useState({
        latitude: 0,
        longitude: 0
    });
    const mapViewRef = React.useRef(null);

    React.useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
        });
        setPin({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });
    };

    const handlePlaceSelect = (data, details = null) => {
        setRegion({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
        });
        setPin({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng
        });
        if (mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }, 1000);
        }
    };

    return (
        <View style={{ marginTop: 20, flex: 1 }}>
            <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}></TouchableOpacity>
            <GooglePlacesAutocomplete
                placeholder="Search"
                fetchDetails={true}
                GooglePlacesSearchQuery={{
                    rankby: "distance"
                }}
                onPress={(data, details) => handlePlaceSelect(data, details)}
                query={{
                    key: "AIzaSyD8F1rCabEAfQj07puS0V5HbgA_sEvAMmU",
                    language: "en",
                    components: "country:uk",
                    types: "establishment",
                    radius: 30000,
                    location: `${region ? region.latitude : 0}, ${region ? region.longitude : 0}`
                }}
                styles={{
                    container: { flex: 0, position: "absolute", width: "100%", zIndex: 1 },
                    listView: { backgroundColor: "white" }
                }}
            />
            {region && (
                <MapView
                    ref={mapViewRef}
                    style={styles.map}
                    initialRegion={region}
                    provider="google"
                >
                    <Marker coordinate={pin} />
                    <Marker
                        coordinate={pin}
                        pinColor="black"
                        draggable={true}
                        onDragStart={(e) => {
                            console.log("Drag start", e.nativeEvent.coordinates)
                        }}
                        onDragEnd={(e) => {
                            setPin({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude
                            })
                        }}
                    >
                        <Callout>
                            <Text>I'm here</Text>
                        </Callout>
                    </Marker>
                    <Circle center={pin} radius={1000} />
                </MapView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    }
})
