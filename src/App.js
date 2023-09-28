import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Amplify, DataStore, Predicates } from "aws-amplify";
import { Post, PostStatus } from "./models";
import "@aws-amplify/ui-react/styles.css";
import { Button, Flex, Text, View, withAuthenticator } from '@aws-amplify/ui-react';

// Use next two lines only if syncing with the cloud
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

const App = ({ signOut, user }) => {

  const [posts, setPosts] = useState([]);

  async function onCreate() {
    const post = await DataStore.save(
      new Post({
        title: `New title ${Date.now()}`,
        rating: Math.floor(Math.random() * (8 - 1) + 1),
        status: PostStatus.ACTIVE,
      })
    );
    setPosts(posts);
    setPosts([...posts, post]);
  }

  async function onDeleteAll() {
    await DataStore.delete(Post, Predicates.ALL);
    setPosts([]);
  }

  useEffect(() => {
      const subscription = DataStore.observe(Post).subscribe((msg) => {
      console.log(msg.model, msg.opType, msg.element);
    });

    return () => subscription.unsubscribe();
  }, []);


  useEffect(() => {
    onQueryAll()
  }, []);

  async function onQueryAll() {
    try {
      const posts = await DataStore.query(Post);
      console.log(posts);
      setPosts(posts);
    } catch (err) { console.log('error fetching data') }
  };

  async function deletePost({ id }) {
    const toDelete = await DataStore.query(Post, id);
    DataStore.delete(toDelete);
    onQueryAll();
  }

  async function onQuery() {
    const posts = await DataStore.query(Post, (c) => c.rating.gt(4));
    setPosts(posts);
    console.log(posts);
  }

  return (
    <View className="App">
      <header className="App-header">
        
        <div className="line">
          <img src={logo} className="App-logo" alt="logo" />
          <div style={{marginRight: '1rem'}}>Hello {user.username}</div>
          <Button onClick={signOut} style={styles.button}>Sign out</Button>
        </div>
        
        <div>
          <input type="button" value="NEW" onClick={onCreate} />
          <input type="button" value="DELETE ALL" onClick={onDeleteAll} />
          <input type="button" value="QUERY ALL" onClick={onQueryAll} />
          <input type="button" value="QUERY rating > 4" onClick={onQuery} />
        </div>

        <View margin="3rem 0">
          {posts.map((post) => (
            <Flex key={post.id || post.t} direction="row" justifyContent="center" alignItems="center">
              <Text as="strong" fontWeight={700} color={"gray"}> {post.id} </Text>
              <Text as="span" color={"gray"}>{post.title}</Text>
              <Text as="span" color={"gray"}>{post.rating}</Text>
              <Button variation="link" onClick={() => deletePost(post)}> Delete </Button>
            </Flex>
          ))}
        </View>

        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
      </header>
    </View>
  );
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 12px' }
}

export default withAuthenticator(App);
