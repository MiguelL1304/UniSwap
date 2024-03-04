import { Image, Text, StyleSheet, View, Button, TouchableOpacity, } from "react-native";
import { BlurView, VibrancyView } from "@react-native-community/blur";

export default function Uploading({image, progress}) {
    return (
        <View style={[StyleSheet.absoluteFill, 
            {
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
            }
        ]}>
            <BlurView>
                {image && (
                    <Image
                        source={{ uri: image}}
                        style={{
                            width: 100,
                            height: 100,
                            resizeMode: "contain",
                            borderRadius: 6,
                        }}
                    />
                )}
                <Text style={{fontSize: 12}}>Uploading...</Text>
                <TouchableOpacity>
                    
                </TouchableOpacity>
            </BlurView>
        </View>
    )
}