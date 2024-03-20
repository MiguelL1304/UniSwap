import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Button
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firestoreDB } from "../../../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import HomeHeader from "../Components/HomeHeader";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import "react-native-gesture-handler";

//default img if no img posted with listing
import defaultImg from "../../assets/defaultImg.png";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";


const Home = () => {
  // search bar
  const [searchQuery, setSearchQuery] = useState("");

  // getting & setting listings from firestore
  const [listings, setListings] = useState([]);

  // filter bottom sheet
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const [filterStack, setFilterStack] = useState(["main"]);
  const [currentFilter, setCurrentFilter] = useState("main");
  const onSelectFilter = (filterName) => {
    //setCurrentFilter(filterName);
    setFilterStack([...filterStack, filterName]);
  };
  const onBack = () => {
    const newStack = [...filterStack];
    newStack.pop();
    setFilterStack(newStack);
  }

  const renderBottomSheetContent = () => {
    const currentFilter = filterStack[filterStack.length - 1];

    switch (currentFilter) {
      case "main":
        return <FilterContent onSelectFilter={onSelectFilter} />;
      case "Category":
        return <CategoryContent onBack={onBack} />;
        break; 
      case "Subject":
        return <SubjectContent onBack={onBack} />;
        break;
      case "Condition":
        return <ConditionContent onBack={onBack} />;
        break;     
      default:
        return <FilterContent onSelectFilter={onSelectFilter} />;  
    }
  }

  function handlePresentModal() {
    bottomSheetModalRef.current?.present();
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestoreDB, "listing"));
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        //console.log(documents);
        setListings(documents);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (

    <View style={styles.container}>
      <HomeHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        //onFilterPress={() => setBottomSheetPosition(0)}
        handlePresentModal={handlePresentModal}
        />

      {/* // display  of listings */}
      <FlatList
        style={styles.listings}
        data={listings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listingItem}>
            <Image
              source={item.listingImg1 ? { uri: item.listingImg1 } : defaultImg}
              style={styles.listingImage}
            />
            <Text style={styles.listingTitle}>{item.title}</Text>
            <Text style={styles.listingPrice}>${item.price}</Text>
          </View>
        )}
        contentContainerStyle={styles.listingsContainer}
      />

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ borderRadius:50 }}
      >
        <View style={styles.bottomSheetModal}>
          {renderBottomSheetContent()}
        </View>
      </BottomSheetModal>
    </View>
  );
};

// first thing you see when you click filter button (category, subject, condition)
const FilterOption = ({ title, onPress}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.filterOption}>{title}</Text>
  </TouchableOpacity>
);

const FilterContent = ({ onSelectFilter }) => (
  <View style={styles.filterContent}>
    <FilterOption title="Category" onPress={() => onSelectFilter("Category")} />
    {/* <Ionicons name="chevron-forward" /> */}
    <FilterOption title="Subject" onPress={() => onSelectFilter("Subject")}/>
    <FilterOption title="Condition" onPress={() => onSelectFilter("Condition")}/>
  </View>
)

const CategoryContent = ({ onBack }) => (
  <View>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back-circle" size="40" color="#3f9eeb"/>
    </TouchableOpacity>
    <Text>Category stuff</Text>
  </View>
)

const SubjectContent = ({ onBack }) => (
  <ScrollView style={styles.scrollViewContainer}>

    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back-circle" size="40" color="#3f9eeb"/>
    </TouchableOpacity>

    {/* SUBJECTS */}
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Accounting</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>African American Studies</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Anthropology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Art</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Biochemistry</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Biology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Business Administration</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Chemistry</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Cinema Media</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Communications</Text>
    </TouchableOpacity >
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Computer Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Economics</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Education</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>English</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Environmental Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Film</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Finance</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>French</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Geography</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Health Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Honors</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Human Services</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Information Technology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Management</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Marketing</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Mathematics</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Music</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Nursing</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Philosophy</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Physical Education</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Political Science</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Psychology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Sociology</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Spanish</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.subjectBox}>
      <Text style={styles.filterSubjectOptions}>Theatre</Text>
    </TouchableOpacity>
  </ScrollView>
)

const ConditionContent = ({ onBack }) => (
  <View>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back-circle" size="40" color="#3f9eeb"/>
    </TouchableOpacity>
    <Text>Condition stuff</Text>
  </View>
)

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f2ff",
  },
  listingsContainer: {
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  listingItem: {
    flex: 1,
    flexDirection: "column",
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listingPrice: {
    fontSize: 16,
    color: "green",
  },
  listingImage: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    margin: 15,
    borderRadius: 15,
  },
  bottomSheetModal: {
    flex: 1,
    alignItems: "left",
    padding: 10,
    marginLeft: 10,
  },
  filterContent: {
    //backgroundColor: "pink",
    //flexDirection: "row",
    //margin: 2,
  },
  filterOption: {
    flexDirection: "row",
    padding: 20,
    //margin: 40,
    fontSize: 20,
    //backgroundColor: "red",
  },
  backButton: {
    //padding: 10,
    //backgroundColor: "red",
    //flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  scrollViewContainer: {
    alignSelf: "stretch",
    //flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Adjust padding as needed
    paddingBottom: 35, // Adjust padding as needed
  },
  subjectBox: {
    //flex: 1,
    //borderTopWidth: 1,
    //borderColor: "#3f9eeb",
    padding: 3,
    margin: 5,
    //backgroundColor: "#e6f2ff",
    //borderRadius: 15,
  },
  filterSubjectOptions: { //individual subjects in the subject option (Accounting, Bio, etc.)
    fontSize: 20,
    padding: 5,
    color: "#3f9eeb",
    //backgroundColor: "#e6f2ff",
  }
});
