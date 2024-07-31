import React from "react";
import Table from "../../app/room/[title]/page"
import { components } from "storybook/internal/components";

export default {

    title: "Pages/CardsView",
    component: Table,

}

export const Cards = () => <Table params={{ title: "Story" }} />;