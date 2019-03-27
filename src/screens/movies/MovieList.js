import React, { Component } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import {
    Header,
    Left,
    Button,
    Body,
    Title,
    Icon,
    Right,
    Text
} from "native-base";
import MovieDetail from './MovieDetail';
import Utility from '../../Utility'
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view'
import styles from '../radio/styles';
import Emoji from 'react-native-emoji';


const genres = ['All', 'Action', 'Animation', 'Children', 'Comedy', 'Fantasy', 'Sci-Fi', 'Horror', 'Fantasy', 'Romance']
export default class MovieList extends Component {
    state = {
        loading: false,
        refreshing: false,
        data: [],
        genres: "",
        page: 0,
        refreshing: false,
        movies: [],
        screenHeight: 0,
        isLoadingMore: false,
        isLastData: false,
    };

    componentWillMount() {
        this.makeRemoteRequest();
    }

    componentDidMount() {
        this.props.navigation.addListener(
            'didFocus',
            payload => {
              this.forceUpdate();
              Utility.makeRecommendations();
            }
          );
    }

    makeRemoteRequest = () => {
        const { genres, page } = this.state;
        console.log("getting " + genres + " page " + page);
        Utility.getMovieList(genres, page).then((response) => {
            this.setState({
                isLastData: response.length > 0 ? false : true,
                data: page === 0 ? response : [...this.state.data, ...response],
                loading: false,
                refreshing: false
            });
        });
    }

    _renderMovies = ({ item, index }) => {
        return <MovieDetail key={index} movie={item} navigate={this.props.navigation} />;
    }

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View
                style={{
                    paddingVertical: 20,
                    borderTopWidth: 1,
                    borderColor: "#CED0CE"
                }}
            >
                <ActivityIndicator animating size="large" />
            </View>
        );
    }

    handleRefresh = () => {
        console.log("handleRefresh");
        this.setState({
            page: 0,
            refreshing: true,
            data: [],
        }, () => {
            this.makeRemoteRequest();
        });
    }

    handleLoadMore = () => {
        console.log("handleLoadMore");
        if (!this.state.isLastData) {
            this.setState({
                isLoadingMore: true,
                page: this.state.page + 1,
                refreshing: true,
            }, () => {
                this.makeRemoteRequest();
            });
        }
    }

    _renderGenres() {
        return genres.map((genres, i) => <Text key={i} tabLabel={genres} />);
    }

    /*tabType*/
    _headerTabView() {
        return (
            <ScrollableTabView
                initialPage={0}
                renderTabBar={() => <ScrollableTabBar />}
                onChangeTab={(obj) => {
                    var tmpGener = "";
                    obj.i === 0 ? tmpGener = "" : tmpGener = genres[obj.i];
                    this.setState({ genres: tmpGener }, () => { this.handleRefresh() });
                }}
            >
                {this._renderGenres()}
            </ScrollableTabView>
        )
    }

    _renderRecommendation = () => {

        this.props.navigation.navigate("MovieRecommendation");

        };


    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.navigate("DrawerOpen")}
                        >
                            <Icon name="ios-menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Movies</Title>
                    </Body>
                    <Right />
                </Header>
        
                <FlatList
                    tabLabel='All'
                    data={this.state.data}
                    renderItem={this._renderMovies.bind(this)}
                    numColumns={2}
                    keyExtractor={item => item._id}
                    ListHeaderComponent={this._headerTabView()}
                    ListFooterComponent={this.renderFooter}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                    onEndReached={this.handleLoadMore}
                    onEndReachedThreshold={0}
                    />
                <View style={ {alignItems: 'center'}}>
                    <TouchableOpacity style={styles.button} onPress={this._renderRecommendation}>
                            <Emoji name="sunglasses" style={styles.emoji}/>
                            <Text style={styles.text}>For You!</Text>
                    </TouchableOpacity>
                </View>
            </View >
        );
    }
}

