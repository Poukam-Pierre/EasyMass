import { Metadata } from 'next';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import * as React from 'react';

export const metadata: Metadata = {
    title: 'Welcome to Easy Messe',
    description: 'Order a mass from anywhere to a parish you want until an hour before pray. Get the way in touch!',
};

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Montserrat:wght@100..900&display=swap"
                        rel="stylesheet"
                    />
                    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
